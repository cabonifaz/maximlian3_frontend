import { useState } from "react";
import { X, Plus, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientInfoSchema,
  type ClientInfoFormData,
  contactSchema,
  type ContactFormData,
} from "@maximilian/schemas";
import { AddRateModal } from "./AddRateModal";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ClientInfoFormData) => void;
}

type Tab = "info" | "rates" | "contacts";
type ContactView = "list" | "create" | "edit" | "detail";

export function AddClientModal({
  isOpen,
  onClose,
  onConfirm,
}: AddClientModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [contactView, setContactView] = useState<ContactView>("list");

  const {
    register: infoRegister,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors },
    reset: infoReset,
  } = useForm<ClientInfoFormData>({
    resolver: zodResolver(clientInfoSchema),
  });

  const {
    register: contactRegister,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors },
    reset: contactReset,
    setValue: setContactValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  if (!isOpen) return null;

  const handleConfirm = (data: ClientInfoFormData) => {
    onConfirm(data);
    infoReset();
    onClose();
  };

  const handleAddContact = (data: ContactFormData) => {
    console.log("Contact added:", data);
    setContactView("list");
    contactReset();
  };

  const openEditContact = (contact: ContactFormData) => {
    Object.keys(contact).forEach((key) => {
      setContactValue(
        key as keyof ContactFormData,
        contact[key as keyof ContactFormData],
      );
    });
    setContactView("edit");
  };

  const openDetailContact = (contact: ContactFormData) => {
    Object.keys(contact).forEach((key) => {
      setContactValue(
        key as keyof ContactFormData,
        contact[key as keyof ContactFormData],
      );
    });
    setContactView("detail");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-brand-black">
            Agrega un Cliente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6 shrink-0">
          <div className="bg-gray-50 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "info"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>Información</span>
              {Object.keys(infoErrors).length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("rates")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "rates"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Tarifas
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                activeTab === "contacts"
                  ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>Contactos</span>
              {Object.keys(contactErrors).length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto min-h-0">
          {activeTab === "info" && (
            <form
              id="client-info-form"
              onSubmit={handleInfoSubmit(handleConfirm)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Tipo Persona
                </label>
                <select
                  {...infoRegister("tipoPersona")}
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                >
                  <option value="">Seleccione</option>
                  <option value="Natural">Persona Natural</option>
                  <option value="Jurídica">Persona Jurídica</option>
                </select>
                {infoErrors.tipoPersona && (
                  <p className="text-xs text-red-500">
                    {infoErrors.tipoPersona.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Nombre
                </label>
                <input
                  {...infoRegister("nombre")}
                  type="text"
                  placeholder="Nombre"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.nombre && (
                  <p className="text-xs text-red-500">
                    {infoErrors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">País</label>
                <select
                  {...infoRegister("pais")}
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                >
                  <option value="">Seleccione</option>
                  <option value="Perú">Perú</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Colombia">Colombia</option>
                </select>
                {infoErrors.pais && (
                  <p className="text-xs text-red-500">
                    {infoErrors.pais.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Dirección
                </label>
                <input
                  {...infoRegister("direccion")}
                  type="text"
                  placeholder="Dirección"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.direccion && (
                  <p className="text-xs text-red-500">
                    {infoErrors.direccion.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input
                  {...infoRegister("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.email && (
                  <p className="text-xs text-red-500">
                    {infoErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Teléfono
                </label>
                <input
                  {...infoRegister("telefono")}
                  type="text"
                  placeholder="Teléfono"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.telefono && (
                  <p className="text-xs text-red-500">
                    {infoErrors.telefono.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Sitio Web
                </label>
                <input
                  {...infoRegister("sitioWeb")}
                  type="text"
                  placeholder="Sitio Web"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.sitioWeb && (
                  <p className="text-xs text-red-500">
                    {infoErrors.sitioWeb.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Tipo Registro Tributario
                </label>
                <select
                  {...infoRegister("tipoRegistroTributario")}
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                >
                  <option value="">Seleccione</option>
                  <option value="RUC">RUC</option>
                  <option value="NIT">NIT</option>
                </select>
                {infoErrors.tipoRegistroTributario && (
                  <p className="text-xs text-red-500">
                    {infoErrors.tipoRegistroTributario.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Representante Legal
                </label>
                <input
                  {...infoRegister("representanteLegal")}
                  type="text"
                  placeholder="Representante Legal"
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300"
                />
                {infoErrors.representanteLegal && (
                  <p className="text-xs text-red-500">
                    {infoErrors.representanteLegal.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Formato Informe
                </label>
                <select
                  {...infoRegister("formatoInforme")}
                  className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none"
                >
                  <option value="">Seleccione</option>
                  <option value="PDF">PDF</option>
                  <option value="Word">Word</option>
                </select>
                {infoErrors.formatoInforme && (
                  <p className="text-xs text-red-500">
                    {infoErrors.formatoInforme.message}
                  </p>
                )}
              </div>
            </form>
          )}

          {activeTab === "rates" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>Nuevo</span>
                  </button>
                  <button className="px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all">
                    Editar
                  </button>
                  <button className="px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-bold">Producto</th>
                      <th className="px-4 py-3 font-bold">País</th>
                      <th className="px-4 py-3 font-bold">Moneda</th>
                      <th className="px-4 py-3 font-bold">Trámite</th>
                      <th className="px-4 py-3 font-bold text-center">
                        Días Min.
                      </th>
                      <th className="px-4 py-3 font-bold text-center">
                        Precio
                      </th>
                      <th className="px-4 py-3 font-bold text-center">
                        Tarifario
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-600">
                          Informe confidencial
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          República Dominicana
                        </td>
                        <td className="px-4 py-3 text-gray-600">Euro</td>
                        <td className="px-4 py-3 text-gray-600 text-center">
                          XP
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-center">
                          3
                        </td>
                        <td className="px-4 py-3 text-brand-black font-bold text-center">
                          45.0
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-center">
                          P
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="animate-in fade-in duration-300">
              {contactView === "list" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        contactReset();
                        setContactView("create");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all"
                    >
                      <Plus size={14} />
                      <span>Agregar Contacto</span>
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      {
                        nombre: "Jorge Ramirez",
                        email: "jramirez@gmail.com",
                        tipoPersona: "Persona Natural",
                        tipoContacto: "Facturación",
                        codigoContacto: "CF001",
                        telefono: "+51 987 654 441",
                        areaTrabajo: "Contabilidad",
                      },
                      {
                        nombre: "Juan Luna",
                        email: "jluna@gmail.com",
                        tipoPersona: "Persona Natural",
                        tipoContacto: "Administrativo",
                        codigoContacto: "CF002",
                        telefono: "+51 987 654 441",
                        areaTrabajo: "Administración",
                      },
                    ].map((contact, i) => (
                      <div
                        key={i}
                        className="py-4 flex items-center justify-between group"
                      >
                        <div className="grid grid-cols-3 flex-1 gap-4">
                          <div>
                            <p className="text-sm font-bold text-brand-black">
                              {contact.nombre}
                            </p>
                            <p className="text-xs text-gray-400">
                              {contact.email}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-600">
                              {contact.tipoContacto}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-600">
                              {contact.telefono}
                            </span>
                          </div>
                        </div>
                        <div className="relative group/menu">
                          <button className="p-2 text-gray-400 hover:text-brand-black rounded-lg transition-all">
                            <MoreHorizontal size={18} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-brand-white border border-gray-100 rounded-xl shadow-xl z-10 hidden group-hover/menu:block py-1">
                            <button
                              onClick={() => openDetailContact(contact)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600"
                            >
                              Ver Detalles
                            </button>
                            <button
                              onClick={() => openEditContact(contact)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600"
                            >
                              Modificar Contacto
                            </button>
                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-red-500">
                              Eliminar Contacto
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(contactView === "create" ||
                contactView === "edit" ||
                contactView === "detail") && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setContactView("list")}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer hover:scale-110 active:scale-90"
                    >
                      <ArrowLeft size={20} className="text-brand-black" />
                    </button>
                    <h3 className="font-bold text-lg text-brand-black">
                      {contactView === "create" && "Creación de Contacto"}
                      {contactView === "edit" && "Modificación de Contacto"}
                      {contactView === "detail" && "Detalles de Contacto"}
                    </h3>
                  </div>

                  <form
                    id="contact-form"
                    onSubmit={handleContactSubmit(handleAddContact)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Tipo Persona
                      </label>
                      <select
                        {...contactRegister("tipoPersona")}
                        disabled={contactView === "detail"}
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none disabled:bg-gray-50"
                      >
                        <option value="">Seleccione</option>
                        <option value="Persona Natural">Persona Natural</option>
                        <option value="Persona Jurídica">
                          Persona Jurídica
                        </option>
                      </select>
                      {contactErrors.tipoPersona && (
                        <p className="text-xs text-red-500">
                          {contactErrors.tipoPersona.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Tipo de Contacto
                      </label>
                      <select
                        {...contactRegister("tipoContacto")}
                        disabled={contactView === "detail"}
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none disabled:bg-gray-50"
                      >
                        <option value="">Seleccione</option>
                        <option value="Facturación">Facturación</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Legal">Legal</option>
                      </select>
                      {contactErrors.tipoContacto && (
                        <p className="text-xs text-red-500">
                          {contactErrors.tipoContacto.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Código de Contacto
                      </label>
                      <input
                        {...contactRegister("codigoContacto")}
                        disabled={contactView === "detail"}
                        type="text"
                        placeholder="Código"
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50"
                      />
                      {contactErrors.codigoContacto && (
                        <p className="text-xs text-red-500">
                          {contactErrors.codigoContacto.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Nombre
                      </label>
                      <input
                        {...contactRegister("nombre")}
                        disabled={contactView === "detail"}
                        type="text"
                        placeholder="Nombre"
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50"
                      />
                      {contactErrors.nombre && (
                        <p className="text-xs text-red-500">
                          {contactErrors.nombre.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Email
                      </label>
                      <input
                        {...contactRegister("email")}
                        disabled={contactView === "detail"}
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50"
                      />
                      {contactErrors.email && (
                        <p className="text-xs text-red-500">
                          {contactErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Teléfono
                      </label>
                      <input
                        {...contactRegister("telefono")}
                        disabled={contactView === "detail"}
                        type="text"
                        placeholder="Teléfono"
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50"
                      />
                      {contactErrors.telefono && (
                        <p className="text-xs text-red-500">
                          {contactErrors.telefono.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">
                        Área de Trabajo
                      </label>
                      <select
                        {...contactRegister("areaTrabajo")}
                        disabled={contactView === "detail"}
                        className="w-full px-4 py-2.5 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all appearance-none disabled:bg-gray-50"
                      >
                        <option value="">Seleccione</option>
                        <option value="Contabilidad">Contabilidad</option>
                        <option value="Administración">Administración</option>
                      </select>
                      {contactErrors.areaTrabajo && (
                        <p className="text-xs text-red-500">
                          {contactErrors.areaTrabajo.message}
                        </p>
                      )}
                    </div>
                  </form>

                  <div className="flex justify-end gap-3 pt-4">
                    {contactView === "detail" ? (
                      <button
                        onClick={() => setContactView("list")}
                        className="px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 transition-all shadow-lg cursor-pointer hover:scale-[1.05] active:scale-95"
                      >
                        Salir
                      </button>
                    ) : (
                      <button
                        type="submit"
                        form="contact-form"
                        className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-white" />
                        <span>
                          {contactView === "create"
                            ? "Agregar Contacto"
                            : "Guardar Cambios"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "info" && (
          <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
            <button
              type="submit"
              form="client-info-form"
              className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </button>
          </div>
        )}

        {activeTab === "rates" && (
          <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
            <button
              onClick={() => setActiveTab("contacts")}
              className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </button>
          </div>
        )}

        {activeTab === "contacts" && contactView === "list" && (
          <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
            <button
              onClick={() => {
                // Main modal confirm logic
                onClose();
              }}
              className="flex items-center gap-2 px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <div className="w-2 h-2 rounded-full bg-brand-white" />
              <span>Confirmar</span>
            </button>
          </div>
        )}
      </div>

      <AddRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onConfirm={(data) => console.log("Rate added:", data)}
      />
    </div>
  );
}
