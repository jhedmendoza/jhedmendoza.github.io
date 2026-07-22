<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8">
          <h2 class="portfolio-title">This is an example of portfolio detail</h2>
          <div class="owl-carousel portfolio-details-carousel">
            <img v-for="(img, i) in images" :key="i" :src="img" class="img-fluid" :alt="`slide ${i+1}`">
          </div>
        </div>
        <div class="col-lg-4 portfolio-info">
          <h3>Project information</h3>
          <ul>
            <li><strong>Category</strong>: Web design</li>
            <li><strong>Client</strong>: ASU Company</li>
            <li><strong>Project date</strong>: 01 March, 2020</li>
            <li><strong>Project URL</strong>: <a href="#">www.example.com</a></li>
          </ul>
          <p>Project description placeholder.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const img1 = new URL('../../assets/img/portfolio/portfolio-details-1.jpg', import.meta.url).href;
const img2 = new URL('../../assets/img/portfolio/portfolio-details-2.jpg', import.meta.url).href;
const img3 = new URL('../../assets/img/portfolio/portfolio-details-3.jpg', import.meta.url).href;

export default {
  name: 'PortfolioDetails',
  data(){
    return { images: [img1, img2, img3] }
  }
}
</script>
