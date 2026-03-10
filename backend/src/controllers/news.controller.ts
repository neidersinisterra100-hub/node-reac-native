import { RequestHandler } from 'express';

export const getNews: RequestHandler = async (req, res) => {
    try {
        const news = [
            {
                id: '1',
                title: 'Nuevo muelle en Timbiquí',
                description: 'Se ha inaugurado un nuevo muelle para mejorar el acceso a las lanchas rápidas.',
                image: 'https://images.unsplash.com/photo-1559139225-42155c69c4fa?q=80&w=500&auto=format&fit=crop',
                date: '2026-02-24',
                category: 'Infraestructura'
            },
            {
                id: '2',
                title: 'Alerta de Marea Alta',
                description: 'Se espera una marea de puja excepcional para este fin de semana. Navegue con precaución.',
                image: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?q=80&w=500&auto=format&fit=crop',
                date: '2026-02-23',
                category: 'Seguridad'
            },
            {
                id: '3',
                title: 'Festival del Currulao',
                description: 'Prepárate para el festival más importante de la región. Reserva tus viajes con tiempo.',
                image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=500&auto=format&fit=crop',
                date: '2026-02-22',
                category: 'Cultura'
            }
        ];
        return res.json(news);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener noticias' });
    }
};
