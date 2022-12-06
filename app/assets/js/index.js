const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");

let productData = [];
let cartData = [];

function init() {
    getProductList();
    getCartList();
}
init();

function combineStr(item) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousand(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousand(item.price)}</p>
    </li>`
}

function render() {
    let str = "";
    productData.forEach(item => {
        str += combineStr(item)
    });
    productList.innerHTML = str;
}

function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then(function (response) {
            productData = response.data.products;
            render()
        })
}

function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            document.querySelector(".js-total").textContent = toThousand(response.data.finalTotal);
            cartData = response.data.carts;
            let str = "";
            cartData.forEach(function (item) {
                str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousand(item.product.price)}</td>
                <td>${item.quantity
                    }</td>
                <td>NT$${toThousand(item.quantity * item.product.price)
                    }</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
            });
            cartList.innerHTML = str;
        })
}


productSelect.addEventListener("change", e => {
    const category = e.target.value;
    if (category === "全部") {
        return render()
    }
    let str = "";
    productData.forEach(item => {
        if (item.category == category) {
            str += combineStr(item);
        }
        productList.innerHTML = str;
    });
})

productList.addEventListener("click", e => {
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if (addCartClass != "js-addCart") {
        return;
        // 可防止點到js-addCart以外地方
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId);

    let checkNum = 1;
    cartData.forEach(function (item) {
        if (item.product.id === productId) {
            checkNum = item.quantity += 1;
            // 如果購物車內已有此商品 
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        // API格式
        "data": {
            "productId": productId,
            "quantity": checkNum
        }
    }).then(function (response) {
        alert("加入購物車");
        getCartList();
    })
})

cartList.addEventListener("click", e => {
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    // 取點擊的data-id

    if (cartId == null) {
        alert("點準一點好嗎");
        return
    }

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).then(function (response) {
        alert("刪除購物車內品項成功");
        getCartList();
    })
})

//刪除全品項
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", e => {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).then(function (response) {
        alert("購物車清空囉");
        getCartList();
    })
        .catch(function (response) {
            alert("購物車已空")
        })
})


//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click", e => {
    e.preventDefault();
    if (cartData.length == 0) {
        alert("購物車沒東西");
        return
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;

    if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == "") {
        alert("資料請填寫完整")
    }

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": tradeWay
            }
        }
    })
        .then(function (response) {
            alert("成功送出訂單");
            document.querySelector("#customerName").value = "";
            document.querySelector("#customerPhone").value = "";
            document.querySelector("#customerEmail").value = "";
            document.querySelector("#customerAddress").value = "";
            document.querySelector("#tradeWay").value = "ATM";
            getCartList();
        })

})


//轉千分位 utility元件工具
function toThousand(num) {
    num = num.toString()
    num = num.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    return num;
}


//validation
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
    "姓名": {
        presence: {
            message: "必填欄位"
        }
    },
    "電話": {
        presence: {
            message: "必填欄位"
        },
        length: {
            minimum: 8,
            message: "需超過 8 碼"
        }
    },
    "信箱": {
        presence: {
            message: "必填欄位"
        },
        email: {
            message: "格式錯誤"
        }
    },
    "寄送地址": {
        presence: {
            message: "必填欄位"
        }
    },
    "交易方式": {
        presence: {
            message: "必填欄位"
        }
    },
};


inputs.forEach((item) => {
    item.addEventListener("change", function () {

        item.nextElementSibling.textContent = '';
        let errors = validate(form, constraints) || '';
        console.log(errors)

        if (errors) {
            Object.keys(errors).forEach(function (keys) {
                // console.log(document.querySelector(`[data-message=${keys}]`))
                document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
            })
        }
    });
});
