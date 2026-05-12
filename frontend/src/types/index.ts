export interface User {
  id: number;
  uuid: string;
  phone?: string;
  email?: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  gender: number;
  city?: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  followCount: number;
  fanCount: number;
  feedCount: number;
  createdAt: string;
}

export interface Pet {
  id: number;
  uuid: string;
  name: string;
  type: 'DOG' | 'CAT' | 'OTHER';
  breed?: string;
  gender: number;
  birthDate?: string;
  weight?: number;
  isNeutered: boolean;
  vaccineStatus: string;
  avatar?: string;
  personalityTags: string[];
  bio?: string;
}

export interface Feed {
  id: number;
  uuid: string;
  user: User;
  content: string;
  images: string[];
  videoUrl?: string;
  topics: string[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  uuid: string;
  seller: User;
  title: string;
  category: 'PET_FOOD' | 'SUPPLIES' | 'PET_LIVE' | 'SECONDHAND';
  price: number;
  originalPrice?: number;
  images: string[];
  description?: string;
  status: 'PENDING' | 'LISTED' | 'UNLISTED' | 'REJECTED';
  city?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNo: string;
  product: Product;
  buyer: User;
  seller: User;
  quantity: number;
  totalFee: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
}
