import axios from 'axios';

export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '31594547-deb644124a3b99171e9eee14b';
  constructor() {
    this.page = 1;
    this.totalPages = null;
    this.searchQuery = null;
  }
  async fetchPhotos() {
    const searchParams = {
      params: {
        key: this.#API_KEY,
        q: this.searchQuery,
        page: this.page,
        per_page: 40,
        image_type: 'photo',
        orientation: 'horizontal',
      },
    };

    const { data } = await axios.get(`${this.#BASE_URL}`, searchParams);

    return data;
  }
}
