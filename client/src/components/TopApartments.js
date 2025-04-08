import React, { useEffect } from 'react';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';
import '../styles/TopApartments.css';

const TopApartments = () => {
  useEffect(() => {
    const sliders = document.querySelectorAll(".booking-slider");

    if (!sliders.length) return;

    const list = [];

    sliders.forEach((element) => {
      const [slider, prevEl, nextEl, pagination] = [
        element.querySelector(".swiper"),
        element.querySelector(".slider-nav__item_prev"),
        element.querySelector(".slider-nav__item_next"),
        element.querySelector(".slider-pagination")
      ];

      list.push(
        new Swiper(slider, {
          slidesPerView: 1.15,
          spaceBetween: 20,
          slidesOffsetBefore: 20,
          slidesOffsetAfter: 20,
          speed: 600,
          observer: true,
          watchOverflow: true,
          watchSlidesProgress: true,
          navigation: { nextEl, prevEl, disabledClass: "disabled" },
          pagination: {
            el: pagination,
            type: "bullets",
            modifierClass: "slider-pagination",
            bulletClass: "slider-pagination__item",
            bulletActiveClass: "active",
            clickable: true
          },
          breakpoints: {
            575: {
              slidesPerView: 1.5
            },
            992: {
              slidesPerView: 2,
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 0
            },
            1366: {
              slidesPerView: 3,
              spaceBetween: 40,
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 0
            }
          }
        })
      );
    });

    return () => {
      list.forEach(swiper => swiper.destroy());
    };
  }, []);

  return (
    <section className="base-template">
      {/* <div className="base-template__wrapper wrapper">
        <h1 className="base-template__title">
          Find Your Perfect Home Away From Home
        </h1>
        <div className="base-template__text">
          Explore a wide selection of rental homes designed to suit your lifestyle.
          <br />
          Experience comfort, convenience, and unforgettable moments in beautifully crafted spaces.
        </div>

        <div className="base-template__content">
          <div className="booking-slider">

            <div className="booking-slider__nav slider-nav">
              <div title="Newest offers" tabIndex="0" className="slider-nav__item slider-nav__item_prev">
                <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 26L2 14L14 2" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div title="Oldest offers" tabIndex="0" className="slider-nav__item slider-nav__item_next">
                <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 26L14 14L2 2" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="booking-slider__slider swiper">
              <div className="booking-slider__wrapper swiper-wrapper">

                <div className="booking-slider__slide swiper-slide">
                  <div className="booking-slider__item booking-slider-item">
                    <div title="The most popular option" className="booking-slider-item__badge">
                      Popular
                    </div>

                    <a title="Luxury Detached Home in Bournemouth" href="/" className="booking-slider-item__image" onClick={(e) => e.preventDefault()}>
                      <img src="https://bato-web-agency.github.io/bato-shared/img/slider-2/slide-1.jpg" alt="Luxury Detached Home in Bournemouth" />
                    </a>

                    <div className="booking-slider-item__content">
                      <div className="booking-slider-item__price">
                        Rs 1,500<small>/month</small>
                      </div>

                      <h2 className="booking-slider-item__title">
                        <a title="Luxury Detached Home in Bournemouth" href="/" onClick={(e) => e.preventDefault()}>
                          Luxury Detached Home in Bournemouth
                        </a>
                      </h2>

                      <div title="Address" className="booking-slider-item__address">
                        <span className="booking-slider-item__address-icon">
                         </span>
                        29 Terrace Rd, BH2 5EL
                      </div>

                      <div className="booking-slider-item__text">
                        Ideal for seaside enthusiasts, offering comfort and easy access to the promenade.
                      </div>

                      <div className="booking-slider-item__footer">
                        <div className="booking-slider-item__footer-inner">
                          <div className="booking-slider-item__amenities">
                            <div className="booking-slider-item__amenity">
                              <div className="booking-slider-item__amenity-icon">
                                <img src="https://bato-web-agency.github.io/bato-shared/img/slider-2/icon-beds.svg" alt="Beds" />
                              </div>
                              <div className="booking-slider-item__amenity-text">4 Beds</div>
                            </div>

                            <div className="booking-slider-item__amenity">
                              <div className="booking-slider-item__amenity-icon">
                                <img src="https://bato-web-agency.github.io/bato-shared/img/slider-2/icon-bathrooms.svg" alt="Bathrooms" />
                              </div>
                              <div className="booking-slider-item__amenity-text">3 Bathrooms</div>
                            </div>

                            <div className="booking-slider-item__amenity">
                              <div className="booking-slider-item__amenity-icon">
                                <img src="https://bato-web-agency.github.io/bato-shared/img/slider-2/icon-squares.svg" alt="Squares" />
                              </div>
                              <div className="booking-slider-item__amenity-text">8x10 m²</div>
                            </div>
                          </div>

                          <a className="booking-slider-item__btn" href="/" onClick={(e) => e.preventDefault()}>
                            <span className="booking-slider-item__btn-text">Explore more</span>
                            <span className="booking-slider-item__btn-icon"></span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>

            <div className="booking-slider__pagination slider-pagination"></div>
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default TopApartments;