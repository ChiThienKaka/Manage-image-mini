export type RootStackParamList = {
  Home: undefined;
  Gallery: {galleryId: string};
  ImagePreview: {galleryId: string; initialIndex: number};
  LockedPreview: {galleryId: string; initialIndex: number};
};
