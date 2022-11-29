import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './fetch-images';
import createMarkup from '../templates/gallery-card.hbs';

const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const pixabayAPI = new PixabayAPI();

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function insertMarkup(array) {
  galleryEl.insertAdjacentHTML('beforeend', createMarkup(array));
  lightbox.refresh();
}

async function onSearchFormElSubmit(event) {
  event.preventDefault();
  const {
    target: {
      elements: {
        searchQuery: { value },
      },
    },
  } = event;
  loadMoreBtn.classList.add('is-hidden');
  if (!value.trim()) {
    Notiflix.Notify.failure('Please enter something!');
    galleryEl.innerHTML = '';
    return;
  }

  pixabayAPI.searchQuery = value.toLowerCase().trim();
  pixabayAPI.page = 1;
  galleryEl.innerHTML = '';

  try {
    const data = await pixabayAPI.fetchPhotos();
    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    pixabayAPI.totalPages = Math.ceil(data.totalHits / 40);
    insertMarkup(data.hits);
    if (pixabayAPI.totalPages > pixabayAPI.page) {
      loadMoreBtn.classList.remove('is-hidden');
    }
  } catch (error) {
    console.error(err.message);
  }
}

searchFormEl.addEventListener('submit', onSearchFormElSubmit);

async function onloadMoreBtnClick() {
  pixabayAPI.page += 1;
  if (pixabayAPI.totalPages === pixabayAPI.page) {
    loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  try {
    const data = await pixabayAPI.fetchPhotos();
    insertMarkup(data.hits);
  } catch (error) {
    console.error(err.message);
  }
}

loadMoreBtn.addEventListener('click', onloadMoreBtnClick);
