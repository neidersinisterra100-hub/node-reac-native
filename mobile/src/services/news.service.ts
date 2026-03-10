import { api } from "./api";

export interface NewsItem {
    id: string;
    title: string;
    description: string;
    image: string;
    date: string;
    category: string;
}

export const getNews = async (): Promise<NewsItem[]> => {
    try {
        const { data } = await api.get<NewsItem[]>("/news");
        return data;
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};
