<template>
  <div class="col-8">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide bg-green">
          <div class="container">
            <div class="mt-5 ml-5 mr-5">
              <div class="row">
                <div class="col-12 text-center">
                  <h1
                    class="text-white font-weight-light"
                    style="font-size: 72px;"
                  >Teste gratuitamente nosso software para psicultura.</h1>
                </div>
              </div>
              <div class="row mt-5">
                <div class="col-12 text-center">
                  <img src="@assets/images/sistema.png" height="404" />
                  <h4 class="text-white font-weight-light ml-5 mr-5">7 dias gratuitos</h4>
                  <h4
                    class="text-white font-weight-light ml-5 mr-5"
                  >Com todas as funcionalidades e acompanhamento de um especialista</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-slide bg-green">
          <div class="container">
            <div class="mt-5 ml-5 mr-5">
              <div class="row">
                <div class="col-12 text-center">
                  <h1
                    class="text-white font-weight-light"
                    style="font-size: 72px;"
                  >Faça agora mesmo seu teste grátis</h1>
                </div>
              </div>
              <div class="row">
                <div class="col-12 text-center">
                  <h3
                    class="text-white font-weight-light"
                    style="font-size: 30px;"
                  >E conheça o software de gestão para psicultura que vai aumentar a rentabilidade da sua propriedade</h3>
                </div>
              </div>
              <div class="row mt-5">
                <div class="col-6 text-center">
                  <img src="@assets/images/idea-256x256-23416.png" />
                  <h4
                    class="text-white font-weight-light ml-5 mr-5"
                  >E conheça o software de gestão para psicultura que vai aumentar a rentabilidade da sua propriedade</h4>
                </div>
                <div class="col-6 text-center">
                  <img src="@assets/images/company-256x256-23441.png" />
                  <h4
                    class="text-white font-weight-light ml-5 mr-5"
                  >E conheça o software de gestão para psicultura que vai aumentar a rentabilidade da sua propriedade</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-scrollbar"></div>
    </div>
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <script type="application/javascript" src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
    <script type="module">
        import Swiper from 'https://unpkg.com/swiper/swiper-bundle.esm.browser.min.js'

        const swiper = new Swiper('.swiper-container', {
            centeredSlides: true,
            pagination: {
            el: '.swiper-pagination',
            clickable: true,
            },
            autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            },
        })
    </script>
  </div>
</template>

<style>
.swiper-container {
  width: 100%;
  height: 100%;
}
.swiper-pagination-bullet-active {
  color: #fff  !important;
  background: #fff  !important;
}
.bg-green {
  background-color: #009978;
}
</style>
