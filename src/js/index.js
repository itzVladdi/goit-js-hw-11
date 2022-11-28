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

function onSearchFormElSubmit(event) {
  event.preventDefault();
  const {
    target: {
      elements: {
        searchQuery: { value },
      },
    },
  } = event;
  if (!value.trim()) {
    Notiflix.Notify.failure('Please enter something!');
    galleryEl.innerHTML = '';
    return;
  }

  pixabayAPI.searchQuery = value.toLowerCase().trim();
  pixabayAPI.page = 1;
  galleryEl.innerHTML = '';

  pixabayAPI
    .fetchPhotos()
    .then(data => {
      loadMoreBtn.classList.add('is-hidden');
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
    })
    .catch(err => console.error(err.message));
}

searchFormEl.addEventListener('submit', onSearchFormElSubmit);

function onloadMoreBtnClick() {
  pixabayAPI.page += 1;

  pixabayAPI
    .fetchPhotos()
    .then(data => {
      if (pixabayAPI.totalPages === pixabayAPI.page) {
        loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        insertMarkup(data.hits);
        return;
      }
      insertMarkup(data.hits);
    })
    .catch(err => console.error(err.message));
}

loadMoreBtn.addEventListener('click', onloadMoreBtnClick);
