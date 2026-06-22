export interface AdminChatsPageProps {
  searchParams: { store?: string; conversation?: string };
}

export interface StoreChatsPageProps {
  searchParams: { q?: string; channel?: string; conversation?: string };
}

export interface StoreInquiriesPageProps {
  searchParams: { page?: string; category?: string };
}

export interface AdminInquiriesPageProps {
  searchParams: { page?: string; category?: string };
}

export interface AdminStoresPageProps {
  searchParams: { page?: string; q?: string };
}

export interface AdminStoreAdmissionsPageProps {
  searchParams: { page?: string };
}
