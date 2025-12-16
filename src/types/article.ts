export interface Article {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}
