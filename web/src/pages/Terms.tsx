import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Terms = () => {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{title}</h3>
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );

  const ListItem = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2">
      <span className="mt-2 w-1.5 h-1.5 bg-dashboard-navy dark:bg-blue-400 rounded-full flex-shrink-0" />
      <span>{children}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-3xl font-bold text-dashboard-navy dark:text-white flex items-center gap-3">
          <FileText className="text-dashboard-orange" size={32} />
          Términos y Condiciones
        </h1>
      </div>

      <div className="bg-white dark:bg-dashboard-blue rounded-xl shadow-sm p-8">
        
        {/* Disclaimer Importante */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
          <p className="text-blue-800 dark:text-blue-200 font-medium italic">
            “Esta plataforma actúa como intermediario tecnológico. El servicio de transporte es prestado directamente por las empresas transportadoras.”
          </p>
        </div>

        <Section title="1. Identificación de la Plataforma">
          <p>
            La plataforma es una aplicación tecnológica que actúa exclusivamente como intermediaria digital entre usuarios pasajeros y empresas de transporte fluvial y/o marítimo legalmente constituidas. 
          </p>
          <p className="mt-2 font-semibold">
            La plataforma NO es propietaria de embarcaciones, NO presta servicios de transporte, ni actúa como empresa transportadora.
          </p>
        </Section>

        <Section title="2. Naturaleza del Servicio">
          <p>Ofrecemos un servicio de intermediación tecnológica, permitiendo a los usuarios:</p>
          <div className="pl-4 mt-2 space-y-1">
            <ListItem>Consultar rutas y horarios</ListItem>
            <ListItem>Comprar tickets digitales</ListItem>
            <ListItem>Validar tickets</ListItem>
            <ListItem>Gestionar pasajeros</ListItem>
            <ListItem>Conectarse con empresas transportadoras independientes</ListItem>
          </div>
          <p className="mt-3 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
            👉 El servicio de transporte es prestado directamente por la empresa transportadora, bajo su exclusiva responsabilidad.
          </p>
        </Section>

        <Section title="3. Empresas Transportadoras">
          <p>Las empresas que operan dentro de la plataforma son personas jurídicas independientes y deben contar con:</p>
          <div className="pl-4 mt-2 mb-4 space-y-1">
            <ListItem>Registro mercantil vigente</ListItem>
            <ListItem>Habilitación para operar transporte fluvial o marítimo</ListItem>
            <ListItem>Embarcaciones certificadas</ListItem>
            <ListItem>Capitanes con licencia válida</ListItem>
            <ListItem>Seguros exigidos por la ley colombiana</ListItem>
          </div>
          <p>La plataforma no asume responsabilidad por:</p>
          <div className="pl-4 mt-2 space-y-1">
            <ListItem>Condiciones de las embarcaciones</ListItem>
            <ListItem>Seguridad del viaje</ListItem>
            <ListItem>Cumplimiento de normas técnicas</ListItem>
            <ListItem>Conducta del personal de la empresa transportadora</ListItem>
          </div>
        </Section>

        <Section title="4. Responsabilidad del Usuario (Pasajero)">
          <p>
            El usuario acepta que el contrato de transporte se celebra directamente con la empresa transportadora. Debe cumplir las normas de seguridad del operador, presentarse a tiempo en el punto de embarque y portar su ticket válido.
          </p>
          <p className="mt-2">
            La plataforma no se hace responsable por cancelaciones por clima, retrasos, cambios de itinerario o incidentes durante el viaje.
          </p>
        </Section>

        <Section title="5. Tickets y Pagos">
          <p>
            El ticket es un comprobante digital de compra. La validez del ticket está sujeta a la fecha y hora del viaje, estado del viaje y validación por la empresa.
          </p>
          <p className="mt-2">
            Los pagos realizados a través de la plataforma son procesados electrónicamente y pueden incluir una comisión por uso de la plataforma.
          </p>
        </Section>

        <Section title="6. Cancelaciones y Reembolsos">
          <p>
            Las políticas de cancelación y reembolso son definidas por cada empresa transportadora. La plataforma puede actuar como intermediaria en la comunicación, pero no garantiza devoluciones automáticas.
          </p>
        </Section>

        <Section title="7. Limitación de Responsabilidad">
          <p>
            La plataforma NO será responsable por accidentes, daños físicos, pérdida de equipaje, fallecimiento, fallas mecánicas o incumplimientos del transportador. Toda reclamación deberá dirigirse directamente contra la empresa transportadora.
          </p>
        </Section>

        <Section title="8. Verificación de Empresas">
          <p>
            La plataforma podrá solicitar documentos legales, marcar empresas como “verificadas” y suspender empresas que incumplan. Sin embargo, la verificación no constituye garantía absoluta del servicio prestado.
          </p>
        </Section>

        <Section title="9. Uso Indebido de la Plataforma">
          <p>
            Está prohibido usar la plataforma con fines fraudulentos, revender tickets sin autorización, manipular validaciones o registrar pasajeros falsos. El incumplimiento puede resultar en suspensión de la cuenta, cancelación de tickets o bloqueo permanente.
          </p>
        </Section>

        <Section title="10. Protección de Datos">
          <p>
            La plataforma cumple con la Ley 1581 de 2012 (Colombia) sobre protección de datos personales. Los datos se usan únicamente para gestión de tickets, contacto operativo y cumplimiento legal.
          </p>
        </Section>

        <Section title="11. Jurisdicción y Ley Aplicable">
          <p>
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier conflicto será resuelto ante los juzgados colombianos competentes.
          </p>
        </Section>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">12. Aceptación</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Al registrarse y usar la plataforma, el usuario declara que ha leído, comprendido y aceptado estos términos.
          </p>
        </div>

      </div>
    </div>
  );
};
