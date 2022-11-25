import Notiflix from 'notiflix';
import { PixabayAPI } from './fetch-images';
import createMarkup from '../templates/gallery-card.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
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
    Notiflix.Notify.failure('Please enter some things!');
    return;
  }
  pixabayAPI.searchQuery = value.toLowerCase().trim();

  galleryEl.innerHTML = '';
  pixabayAPI.page = 1;

  pixabayAPI
    .fetchPhotos()
    .then(data => {
      if (data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      pixabayAPI.totalPages = Math.ceil(data.totalHits / 40);

      insertMarkup(data.hits);

      if (pixabayAPI.totalPages === pixabayAPI.page) {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      loadMoreBtn.classList.remove('is-hidden');
    })
    .catch(err => console.error(err.message));
}

searchFormEl.addEventListener('submit', onSearchFormElSubmit);

function onGalleryElClick() {
  pixabayAPI.page += 1;

  pixabayAPI
    .fetchPhotos()
    .then(data => {
      console.log(pixabayAPI.totalPages);
      console.log(pixabayAPI.page);

      if (pixabayAPI.totalPages <= pixabayAPI.page) {
        loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        insertMarkup(data.hits);
        return;
      }
      insertMarkup(data.hits);
    })
    .catch(err => console.error(err.message));
}

loadMoreBtn.addEventListener('click', onGalleryElClick);
