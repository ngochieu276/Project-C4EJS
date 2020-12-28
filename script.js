"strict";
const cartItem = document.querySelector(".cart-items");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const productCenter = document.querySelector(".products-center");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart-content");
const cartItems = document.querySelector(".cart-items");
let cartTotal = document.querySelector(".cart-total");
const cartBtn = document.querySelector(".cart-btn");

let cart = [];
let buttonDOM = [];
//////////////Model//////////////////
class Model {
  getProduct = async function () {
    try {
      const res = await fetch("./products.json");
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      let products = data.items;
      return products;
    } catch (err) {
      console.log(err);
    }
  };
}

// state.products = getProduct();

class View {
  setupApp() {
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    cart = Storage.getCart();
    this.setcartValues(cart);
    this.displaySaveCart(cart);
  }

  displayProduct(products) {
    products.forEach((product) => {
      const html = `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping cart"></i>
              Add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`;
      productCenter.insertAdjacentHTML("afterbegin", html);
    });
  }

  getBagButton() {
    const bagButton = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = bagButton;
    bagButton.forEach((button) => {
      const id = button.dataset.id;
      const inCart = cart.find((item) => item.id === id);
      if (inCart) {
        bagButton.innerText = "In Cart";
        bagButton.disabled = true;
      } else {
        button.addEventListener("click", (e) => {
          e.target.innerText = "In Cart";
          e.target.disabled = true;

          // get product from products
          const cartItem = { ...Storage.getProducts(id), amount: 1 };
          // add product to Cart
          cart = [...cart, cartItem];
          // add to Locastorage
          Storage.saveCart(cart);
          // set Cart Value
          this.setcartValues(cart);
          // display Cart Item
          this.displayCartContent(cartItem);
          // show Cart
          this.showCart();
        });
      }
    });
  }

  displaySaveCart(cart) {
    cart.forEach((item) => this.displayCartContent(item));
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setcartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
  }

  displayCartContent(item) {
    const html = `
    <div class="cart-item">
       <div class="cart-details">
         <img src=${item.image} />
            <div class="cart-infor">
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
       </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
    </div>`;
    cartContent.insertAdjacentHTML("afterbegin", html);
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        // remove  item from carts
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        // xóa phần tử khỏi cart-items, set lại value cart trong cartscarts
        this.removeItem(id);
      }
      if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        addAmount.nextElementSibling.innerText = tempItem.amount;
        this.setcartValues(cart);
        Storage.saveCart(cart);
      }
      if (e.target.classList.contains("fa-chevron-down")) {
        let downAmount = e.target;
        let id = downAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        Storage.saveCart(cart);
        if (tempItem.amount > 0) {
          downAmount.previousElementSibling.innerText = tempItem.amount;
          this.setcartValues(cart);
        } else {
          cartContent.removeChild(downAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    // xóa tất cả các cart trong cart
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setcartValues(cart);
    Storage.saveCart(cart);
    // lấy button product tương ứng với cart
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerText = `Add to bag`;
  }

  getSingleButton(id) {
    return buttonDOM.find((item) => item.dataset.id === id);
  }
}

class Storage {
  static saveProducts(product) {
    localStorage.setItem("product", JSON.stringify(product));
  }

  static getProducts(id) {
    let product = JSON.parse(localStorage.getItem("product"));
    return product.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const model = new Model();
  const view = new View();
  view.setupApp();
  model
    .getProduct()
    .then((products) => {
      view.displayProduct(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      view.getBagButton();
      view.cartLogic();
    });
});
