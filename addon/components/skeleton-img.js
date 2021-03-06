import {
  getWithDefault,
  setProperties,
  get,
  set
} from '@ember/object';
import { removeObserver, addObserver } from '@ember/object/observers';
import Component from '@ember/component';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['src'],
  classNames: ['skeleton-img'],
  classNameBindings: ['loadState'],

  renderSrc: true,

  init() {
    this._super(...arguments);

    let renderSrc = get(this, 'renderSrc');

    set(this, 'imgBindings', {
      load: this.load.bind(this),
      error: this.error.bind(this),
      setup: this.setupActualImg.bind(this)
    });

    set(this, 'actualSrc', get(this, 'src'));
    set(this, 'src', get(this, 'tmpSrc'));
    set(this, 'loadState', 'loading');

    if (renderSrc) {
      this.setupActualImg();
    } else {
      addObserver(this, 'renderSrc', get(this, 'imgBindings.setup'));
    }
  },

  setupActualImg() {
    let imgSrc =  get(this, 'actualSrc');
    let img = { src: imgSrc };

    removeObserver(this, 'renderSrc', get(this, 'imgBindings.setup'));

    if (typeof Image !== 'undefined') {
      img = new Image();
      img.src = imgSrc;
      img.addEventListener('load', get(this, 'imgBindings.load'));
      img.addEventListener('error', get(this, 'imgBindings.error'));
    }

    set(this, 'actualImg', img);
  },

  load() {
    let { src } = get(this, 'actualImg');
    setProperties(this, { loadState: 'loaded', src });
  },

  error() {
    let src = get(this, 'src');
    let tmpSrc = get(this, 'tmpSrc');
    let errorSrc = getWithDefault(this, 'errorSrc', tmpSrc);

    if (errorSrc !== src) {
      set(this, 'src', errorSrc);
    }

    set(this, 'loadState', 'load-error');
  }
});
