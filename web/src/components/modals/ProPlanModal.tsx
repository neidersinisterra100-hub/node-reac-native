import { LucideIcon, Zap, CheckCircle2 } from "lucide-react";
import React from "react";

interface ProPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProPlanModal({ isOpen, onClose }: ProPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold">Desbloquea el Plan Pro</h2>
            <p className="text-blue-100 mt-2 text-sm">Lleva tu empresa de transporte al siguiente nivel.</p>
        </div>

        <div className="p-6">
            <h3 className="text-gray-900 font-semibold mb-4 text-center">Esta función es exclusiva para miembros Pro</h3>
            
            <ul className="space-y-3 mb-8">
                <FeatureItem text="Reportes avanzados de ventas y ocupación" />
                <FeatureItem text="Gestión ilimitada de flotas y conductores" />
                <FeatureItem text="Soporte prioritario 24/7" />
                <FeatureItem text="Exportación de datos a Excel/PDF" />
            </ul>

            <div className="space-y-3">
                <button 
                    onClick={() => {
                        // Aquí iría la redirección a la pasarela de pago
                        alert("Redirigiendo a pasarela de pagos..."); 
                        onClose();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                    Actualizar a Pro ahora
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                    Quizás más tarde
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <span className="text-gray-600 text-sm">{text}</span>
        </li>
    );
}
