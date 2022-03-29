<script>
import { Loader } from '@googlemaps/js-api-loader'

export default {
  props: {
    modal: {
      type: Object,
      required: false,
      default: () => ({
        title: 'Marque onde a piscicultura está localizada',
        size: 'xl',
      }),
    },
    mapConfig: {
      type: Object,
      required: false,
      default: () => ({
        center: {
          lat: -14,
          lng: -53,
        },
        zoom: 4,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        disableDefaultUI: false,
        mapTypeId: 'terrain',
      }),
    },
    markerConfig: {
      type: Object,
      required: false,
      default: () => ({
        draggable: true,
        visible: false,
        position: {
          lat: -14,
          lng: -53,
        },
      }),
    },
    apiKey: String,
  },
  data() {
    return {
      google: null,
      map: null,
      marker: null,
      searchBox: null,
      isMapLoaded: false,
    }
  },
  async mounted() {
    new Loader({
      apiKey: process.env.VUE_APP_GOOGLE_MAP,
      version: 'weekly',
      libraries: ['places', 'drawing'],
    })
      .load()
      .then((google) => {
        this.google = google
      })
  },
  methods: {
    initializeMap() {
      const mapContainer = this.$refs.googleMap
      this.map = new this.google.maps.Map(mapContainer, this.mapConfig)
      this.map.addListener('click', this.onGoogleMapClick)
      this.google.maps.event.addListenerOnce(this.map, 'tilesloaded', () => {
        this.isMapLoaded = true
        this.initializeMarker()
      })
    },
    initializeSearchBox() {
      const input = this.$refs.searchRef
      this.searchBox = new this.google.maps.places.SearchBox(input)
      //this.map.controls[this.google.maps.ControlPosition.TOP_LEFT].push(input)
      this.map.addListener("bounds_changed", () => {
        this.searchBox.setBounds(this.map.getBounds());
      })
      this.searchBox.addListener('places_changed', () => {
        const place = this.searchBox.getPlaces()[0]

        if (!place || !place.geometry || !place.geometry.location) {
          return
        } 

        const bounds = new this.google.maps.LatLngBounds()
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
        this.map.fitBounds(bounds);
      })
    },
    initializeMarker() {
      this.marker = new this.google.maps.Marker({
        ...this.markerConfig,
        map: this.map,
      })
      this.marker.addListener('dragend', this.onGoogleMarkerDragEnd)
    },
    showGoogleModal() {
      this.$refs['google-modal'].show()
    },
    onGoogleModalShown() {
      this.initializeMap()
      this.initializeSearchBox()
    },
    onGoogleModalHide() {
      this.mapConfig.center.lat = this.map.center.lat()
      this.mapConfig.center.lng = this.map.center.lng()
      this.mapConfig.zoom = this.map.zoom
      this.isMapLoaded = false
    },
    onGoogleMapClick(event) {
      this.markerConfig.visible = true
      this.setMarkerLatLng(event.latLng)
    },
    onGoogleMarkerDragEnd(event) {
      this.setMarkerLatLng(event.latLng)
    },
    setMarkerLatLng(latLng) {
      this.markerConfig.position.lat = latLng.lat()
      this.markerConfig.position.lng = latLng.lng()
      this.$emit('onMarkerCoordsChange', {
        lat: latLng.lat(),
        lng: latLng.lng(),
      })
      this.updateMarker()
    },
    updateMarker() {
      this.marker.setOptions(this.markerConfig)
    },
  },
}
</script>

<template>
  <b-modal
    ref="google-modal"
    :title="modal.title"
    :size="modal.size"
    @shown="onGoogleModalShown"
    @hide="onGoogleModalHide"
  >
    <b-form-group 
      v-show="isMapLoaded"
      label="Pesquisar" 
      label-for="pac-input"
    >
      <input
        id="pac-input"
        ref="searchRef"
        class="controls form-control search-box"
        type="text"
        placeholder="Pesquisar"
      />
    </b-form-group>
    <div class="google-map" ref="googleMap"></div>
    <template #modal-footer="{ ok }">
      <b-button variant="primary" @click="ok()">Concluir</b-button>
    </template>
  </b-modal>
</template>

<style>
.google-map {
  height: 500px;
}
.search-box {
  width: 30%;
  margin-bottom: 1rem;
}
.pac-container {
  z-index: 10000;
}
</style>