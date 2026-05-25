import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { servicioBanco } from "@maximilian/services/banco.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { BancoCrearRequest, BancoEditarRequest, BancoListaItem } from "@maximilian/shared/types/banco.type";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomModalBancoAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBancoAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroBancoAnalista) => void;
}

interface PropsCustomModalBusquedaBancoAnalista {
  estaAbierto: boolean;
  onCerrar: () => void;
  onSeleccionar: (banco: BancoListaItem) => void;
}

interface PropsCustomModalCrearBancoAnalista {
  estaAbierto: boolean;
  bancoInicial?: BancoListaItem | null;
  onCerrar: () => void;
  onBancoCreado: (banco: BancoListaItem) => void;
}

function CustomModalCrearBancoAnalista({
  estaAbierto,
  bancoInicial,
  onCerrar,
  onBancoCreado,
}: PropsCustomModalCrearBancoAnalista) {
  const queryClient = useQueryClient();
  const [idPais, setIdPais] = useState<number | undefined>(bancoInicial?.idPais);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!estaAbierto) {
      setNombre("");
      setTelefono("");
      return;
    }

    setIdPais(bancoInicial?.idPais);
    setNombre(bancoInicial?.nombre ?? "");
    setTelefono(bancoInicial?.telefono ?? "");
  }, [bancoInicial?.idPais, bancoInicial?.nombre, bancoInicial?.telefono, estaAbierto]);

  const guardarBancoMutation = useMutation({
    mutationFn: async () => {
      const payloadBase = {
        idPais: idPais ?? 0,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
      };

      const respuesta = bancoInicial?.idBanco
        ? await servicioBanco.editar({
          idBanco: bancoInicial.idBanco,
          ...payloadBase,
        } satisfies BancoEditarRequest)
        : await servicioBanco.crear(payloadBase satisfies BancoCrearRequest);
      await queryClient.invalidateQueries({ queryKey: ["bancos-busqueda-modal"] });

      if (respuesta.idBanco) {
        const bancoCreado = await servicioBanco.obtener({ idBanco: respuesta.idBanco });
        if (bancoCreado) return bancoCreado;
      }

      const pais = opcionesPais?.find((opcion) => opcion.num1 === payloadBase.idPais)?.string1 ?? "-";

      return {
        idBanco: respuesta.idBanco ?? bancoInicial?.idBanco ?? 0,
        idPais: payloadBase.idPais,
        nombre: payloadBase.nombre,
        telefono: payloadBase.telefono,
        pais,
      } satisfies BancoListaItem;
    },
    onSuccess: (bancoCreado) => {
      onBancoCreado(bancoCreado);
      onCerrar();
    },
  });

  if (!estaAbierto) return null;

  const formularioInvalido = !idPais || !nombre.trim() || !telefono.trim();

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">{bancoInicial ? "Editar Banco" : "Nuevo Banco"}</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              {bancoInicial ? "Actualizacion en base de datos" : "Registro en base de datos"}
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} disabled={guardarBancoMutation.isPending}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-4 px-7 py-6">
          <CustomSelectorBuscable
            label="Pais"
            options={opcionesPais}
            value={idPais}
            onChange={setIdPais}
            onClear={() => setIdPais(undefined)}
            required
            placeholder="Seleccione un país"
          />

          <div className="space-y-2">
            <CustomLabel required>Nombre del Banco</CustomLabel>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ingrese el nombre del banco"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none focus:border-brand-black"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel required>Telefono</CustomLabel>
            <input
              value={telefono}
              onChange={(event) => setTelefono(event.target.value)}
              placeholder="Ingrese el teléfono del banco"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none focus:border-brand-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar} disabled={guardarBancoMutation.isPending}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={() => guardarBancoMutation.mutate()}
            disabled={formularioInvalido}
            loading={guardarBancoMutation.isPending}
            loadingText="Guardando..."
          >
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

function CustomModalBusquedaBancoAnalista({
  estaAbierto,
  onCerrar,
  onSeleccionar,
}: PropsCustomModalBusquedaBancoAnalista) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idBancoSeleccionado, setIdBancoSeleccionado] = useState<number | null>(null);
  const [estaAbiertoModalCrearBanco, setEstaAbiertoModalCrearBanco] = useState(false);
  const [bancoEnEdicion, setBancoEnEdicion] = useState<BancoListaItem | null>(null);
  const [bancoAEliminar, setBancoAEliminar] = useState<BancoListaItem | null>(null);
  const busquedaConRetardo = useRetardo(busqueda);
  const queryClient = useQueryClient();

  const {
    data: respuestaBancos,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bancos-busqueda-modal", busquedaConRetardo, paginaActual],
    queryFn: () => servicioBanco.list({
      busqueda: busquedaConRetardo.trim() || undefined,
      numPag: paginaActual,
    }),
    enabled: estaAbierto,
    retry: false,
  });

  const bancos = respuestaBancos?.lstBanco ?? [];

  useEffect(() => {
    if (!estaAbierto) {
      setBusqueda("");
      setPaginaActual(1);
      setIdBancoSeleccionado(null);
    }
  }, [estaAbierto]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaConRetardo]);

  useEffect(() => {
    if (!bancos.length) {
      setIdBancoSeleccionado(null);
      return;
    }

    setIdBancoSeleccionado((valorActual) => (
      valorActual != null && bancos.some((banco) => banco.idBanco === valorActual)
        ? valorActual
        : bancos[0]?.idBanco ?? null
    ));
  }, [bancos]);

  const bancoSeleccionado = useMemo(
    () => bancos.find((banco) => banco.idBanco === idBancoSeleccionado) ?? null,
    [bancos, idBancoSeleccionado],
  );

  const eliminarBancoMutation = useMutation({
    mutationFn: async () => {
      if (!bancoAEliminar?.idBanco) {
        throw new Error("No se encontró el banco a eliminar.");
      }

      await servicioBanco.eliminar({ idBanco: bancoAEliminar.idBanco });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bancos-busqueda-modal"] });
      setBancoAEliminar(null);
      if (bancoSeleccionado?.idBanco === bancoAEliminar?.idBanco) {
        setIdBancoSeleccionado(null);
      }
    },
  });

  if (!estaAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-black">Busqueda de Banco</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Seleccione un banco registrado</p>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={18} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-5 overflow-y-auto px-8 py-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1 space-y-2">
                <CustomLabel>Busqueda</CustomLabel>
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar por nombre del banco..."
                    className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-slate-600 outline-none focus:border-brand-black"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setBancoEnEdicion(null);
                    setEstaAbiertoModalCrearBanco(true);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
                >
                  <Plus size={16} />
                  Agregar nuevo banco
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Banco</th>
                    <th className="px-4 py-3">Pais</th>
                    <th className="px-4 py-3">Telefono</th>
                    <th className="px-4 py-3 text-right">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Cargando bancos...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <div className="space-y-3">
                          <p className="text-sm text-red-500">No se pudo cargar la lista de bancos.</p>
                          <CustomButton variant="secondary" size="sm" onClick={() => void refetch()}>
                            Reintentar
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ) : bancos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                        No se encontraron bancos registrados.
                      </td>
                    </tr>
                  ) : (
                    bancos.map((banco) => {
                      const estaSeleccionado = banco.idBanco === idBancoSeleccionado;

                      return (
                        <tr
                          key={banco.idBanco}
                          className={`cursor-pointer ${estaSeleccionado ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                          onClick={() => setIdBancoSeleccionado(banco.idBanco)}
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-slate-700">{banco.nombre}</td>
                          <td className="px-4 py-4 text-sm text-slate-500">{banco.pais}</td>
                          <td className="px-4 py-4 text-sm text-slate-500">{banco.telefono}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-3 text-sm font-semibold">
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBancoEnEdicion(banco);
                                  setEstaAbiertoModalCrearBanco(true);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-700"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBancoAEliminar(banco);
                                }}
                              >
                                Eliminar
                              </button>
                              <span className="text-blue-600">
                                {estaSeleccionado ? "Seleccionado" : "Seleccionar"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {respuestaBancos?.totalRegistros ?? 0} banco(s) encontrado(s)
              </p>

              <div className="flex items-center gap-2">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPaginaActual((pagina) => Math.max(1, pagina - 1))}
                  disabled={paginaActual <= 1 || isLoading}
                >
                  Anterior
                </CustomButton>
                <span className="text-sm font-medium text-slate-500">
                  Pagina {paginaActual} de {respuestaBancos?.totalPaginas ?? 1}
                </span>
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPaginaActual((pagina) => pagina + 1)}
                  disabled={isLoading || paginaActual >= (respuestaBancos?.totalPaginas ?? 1)}
                >
                  Siguiente
                </CustomButton>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 px-8 py-5">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cancelar
            </CustomButton>
            <CustomButton size="sm" onClick={() => bancoSeleccionado && onSeleccionar(bancoSeleccionado)} disabled={!bancoSeleccionado}>
              Seleccionar
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalCrearBancoAnalista
        estaAbierto={estaAbiertoModalCrearBanco}
        bancoInicial={bancoEnEdicion}
        onCerrar={() => {
          setEstaAbiertoModalCrearBanco(false);
          setBancoEnEdicion(null);
        }}
        onBancoCreado={(bancoCreado) => {
          setEstaAbiertoModalCrearBanco(false);
          setBancoEnEdicion(null);
          onSeleccionar(bancoCreado);
        }}
      />

      <CustomModalConfirmacionAccion
        isOpen={bancoAEliminar != null}
        onClose={() => setBancoAEliminar(null)}
        onConfirm={() => eliminarBancoMutation.mutate()}
        title="Eliminar Banco"
        descripcion="Se eliminará el banco seleccionado de la base de datos."
        isSubmitting={eliminarBancoMutation.isPending}
        textoConfirmar="Eliminar"
        textoCargandoConfirmar="Eliminando..."
        varianteConfirmar="danger"
      >
        <p><span className="font-bold">Banco:</span> {bancoAEliminar?.nombre ?? "-"}</p>
        <p><span className="font-bold">Pais:</span> {bancoAEliminar?.pais ?? "-"}</p>
      </CustomModalConfirmacionAccion>
    </>
  );
}

export function CustomModalBancoAnalista({
  estaAbierto,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalBancoAnalista) {
  const [idBanco, setIdBanco] = useState<number | undefined>(registroInicial?.idBanco);
  const [idPais, setIdPais] = useState<number | undefined>(registroInicial?.idPais);
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [banco, setBanco] = useState(registroInicial?.banco ?? "");
  const [sector, setSector] = useState(registroInicial?.sector ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [numeroCuenta, setNumeroCuenta] = useState(registroInicial?.numeroCuenta ?? "");
  const [sectoristaJefeCuenta, setSectoristaJefeCuenta] = useState(registroInicial?.sectoristaJefeCuenta ?? "");
  const [estaAbiertoModalBusqueda, setEstaAbiertoModalBusqueda] = useState(false);

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!banco.trim() || !sector.trim() || !telefono.trim() || !numeroCuenta.trim()) return;

    onGuardar({
      idBanco,
      idPais,
      pais: pais.trim() || undefined,
      banco: banco.trim(),
      sector: sector.trim(),
      telefono: telefono.trim(),
      numeroCuenta: numeroCuenta.trim(),
      sectoristaJefeCuenta: sectoristaJefeCuenta.trim(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-black">{registroInicial ? "Editar Cuenta Bancaria" : "Agregar Cuenta Bancaria"}</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de cuentas bancarias</p>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={18} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-4 overflow-y-auto px-7 py-6">
            <div className="space-y-2">
              <CustomLabel>Bancos</CustomLabel>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                <input
                  value={banco}
                  onChange={(event) => setBanco(event.target.value)}
                  placeholder="Nombre del banco"
                  className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none"
                />
                <CustomButton size="sm" className="bg-[#ff6a2b] hover:bg-[#ff6a2b]/90" onClick={() => setEstaAbiertoModalBusqueda(true)}>
                  <Search size={14} />
                  Buscar
                </CustomButton>
              </div>
            </div>

            <div className="space-y-2">
              <CustomLabel>Número de Cuenta</CustomLabel>
              <input value={numeroCuenta} onChange={(event) => setNumeroCuenta(event.target.value)} placeholder="0000 0000 0000" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Lista de Sectores</CustomLabel>
              <input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Ingrese el sector" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Sectorista / Jefe de Cuenta</CustomLabel>
              <input value={sectoristaJefeCuenta} onChange={(event) => setSectoristaJefeCuenta(event.target.value)} placeholder="Nombre del sectorista o jefe de cuenta" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Numero(s) de Teléfono</CustomLabel>
              <input value={telefono} onChange={(event) => setTelefono(event.target.value)} placeholder="+52 ..." className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            {pais ? (
              <p className="text-xs text-slate-400">Pais del banco: {pais}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>Cancelar</CustomButton>
            <CustomButton size="sm" onClick={manejarGuardar}>Guardar</CustomButton>
          </div>
        </div>
      </div>

      <CustomModalBusquedaBancoAnalista
        estaAbierto={estaAbiertoModalBusqueda}
        onCerrar={() => setEstaAbiertoModalBusqueda(false)}
        onSeleccionar={(resultado) => {
          setIdBanco(resultado.idBanco);
          setIdPais(resultado.idPais);
          setPais(resultado.pais);
          setBanco(resultado.nombre);
          setTelefono(resultado.telefono);
          setEstaAbiertoModalBusqueda(false);
        }}
      />
    </>
  );
}
