import BasePage from "../base-page";
class FlashCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute("product"));

    if (window.app?.status === "ready") {
      this.onReady();
    } else {
      document.addEventListener("theme::ready", () => this.onReady());
    }
  }

  onReady() {
    this.fitImageHeight = salla.config.get("store.settings.product.fit_type");
    salla.wishlist.event.onAdded((event, id) => this.toggleFavoriteIcon(id));
    salla.wishlist.event.onRemoved((event, id) =>
      this.toggleFavoriteIcon(id, false)
    );
    this.placeholder = salla.url.asset(
      salla.config.get("theme.settings.placeholder")
    );
    this.getProps();

    // Get page slug
    this.source = salla.config.get("page.slug");

    // If the card is in the landing page, hide the add button and show the quantity
    if (this.source == "landing-page") {
      this.hideAddBtn = true;
      this.showQuantity = true;
    }

    salla.lang.onLoaded(() => {
      // Language
      this.remained = salla.lang.get("pages.products.remained");
      this.donationAmount = salla.lang.get("pages.products.donation_amount");
      this.startingPrice = salla.lang.get("pages.products.starting_price");
      this.addToCart = salla.lang.get("pages.cart.add_to_cart");
      this.outOfStock = salla.lang.get("pages.products.out_of_stock");

      // re-render to update translations
      this.render();
    });

    this.render();
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector(".s-product-card-content-pie-svg-bar"),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  toggleFavoriteIcon(id, isAdded = true) {
    document
      .querySelectorAll('.s-product-card-wishlist-btn[data-id="' + id + '"]')
      .forEach((btn) => {
        app.toggleElementClassIf(
          btn,
          "s-product-card-wishlist-added",
          "not-added",
          () => isAdded
        );
        app.toggleElementClassIf(
          btn,
          "pulse-anime",
          "un-favorited",
          () => isAdded
        );
      });
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  getProductBadge() {
    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.product.promotion_title}</div>`;
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity">${this.remained} ${salla.helpers.number(
        this.product?.quantity
      )}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    }
    return "";
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get("store.settings.product.show_price_as_dash")
        ? "-"
        : "";
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = "";
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(
                    this.product?.starting_price
                  )} </h4>
              </div>`;
    } else {
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(
        this.product?.price
      )}</h4>`;
    }

    return price;
  }

  getAddButtonLabel() {
    if (this.product.status === "sale" && this.product.type === "booking") {
      return salla.lang.get("pages.cart.book_now");
    }

    if (this.product.status === "sale") {
      return salla.lang.get("pages.cart.add_to_cart");
    }

    if (this.product.type !== "donating") {
      return salla.lang.get("pages.products.out_of_stock");
    }

    // donating
    return salla.lang.get("pages.products.donation_exceed");
  }

  getProps() {
    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute("horizontal");

    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute("shadowOnHover");

    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute("hideAddBtn");

    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute("fullImage");

    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute("minimal");

    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute("isSpecial");

    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute("showQuantity");
  }

  render() {
    this.classList.add("s-product-card-entry");
    this.setAttribute("id", this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal
      ? this.classList.add("s-product-card-vertical")
      : "";
    this.horizontal && !this.fullImage && !this.minimal
      ? this.classList.add("s-product-card-horizontal")
      : "";
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal
      ? this.classList.add("s-product-card-fit-height")
      : "";
    this.isSpecial ? this.classList.add("s-product-card-special") : "";
    this.fullImage ? this.classList.add("s-product-card-full-image") : "";
    this.minimal ? this.classList.add("s-product-card-minimal") : "";
    this.product?.donation ? this.classList.add("s-product-card-donation") : "";
    this.shadowOnHover ? this.classList.add("s-product-card-shadow") : "";
    this.product?.is_out_of_stock
      ? this.classList.add("s-product-card-out-of-stock")
      : "";

    this.innerHTML = `
    <div class="crad rounded p-2 flex flex-col">
    <div class="relative">
      <img
        src=${this?.product?.image?.url}
        alt=${this?.product?.image?.alt}
        class="object-cover rounded-[1rem] w-full min-h-[25rem] max-h-[25rem]"
      />
      ${
        !this.hideAddBtn
          ? `
      <salla-button 
                  shape="icon" 
                  fill="outline" 
                  color="light" 
                  id="card-wishlist-btn-${this.product.id}-horizontal"
                  aria-label="Add or remove to wishlist"
                  class="absolute rounded bottom-1 right-1"
                  onclick="salla.wishlist.toggle(${this.product.id})"
                  data-id="${this.product.id}">
                  <i class="sicon-heart"></i> 
                </salla-button>
      `
          : ""
      }
    </div>
    <p class="text-gray-400 font-[700] py-[1rem] text-[1rem]">
    <a href="${this.product?.url}">${this.product?.name}</a>
    </p>
    <div class="s-product-card-content-sub ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            ${this.getProductPrice()}
            ${this.product?.rating?.stars && !this.minimal ?
              `<div class="s-product-card-rating">
                <i class="sicon-star2"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
               : ``}
          </div>
    ${this.isSpecial && this.product.discount_ends
      ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true}
        labeled=${true} />`
      : ``}
    <div class="mt-auto">
      <div class="flex justify-between">
        <salla-add-product-button fill="outline" width="wide"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}">
                ${
                  this.product.status == "sale"
                    ? `<i class="text-[16px] sicon-${
                        this.product.type == "booking"
                          ? "calendar-time"
                          : "add-to-cart"
                      }"></i>`
                    : ``
                }
                ${this.product.add_to_cart_label ? this.product.add_to_cart_label : this.getAddButtonLabel() }
              </salla-add-product-button>
      </div>
    </div>
  </div>
      `;
    // re-init favorite icon
    if (!salla.config.isGuest()) {
      salla.storage
        .get("salla::wishlist", [])
        .forEach((id) => this.toggleFavoriteIcon(id));
    }

    document.lazyLoadInstance?.update(this.querySelectorAll(".lazy"));

    if (this.product?.quantity && this.isSpecial) {
      this.initCircleBar();
    }
  }
}

customElements.define("custom-salla-product-card", FlashCard);
