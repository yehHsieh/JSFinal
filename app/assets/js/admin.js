let orderData = [];
const orderList = document.querySelector(".js-orderList");

function init() {
    getOrderList();
}
init();


function renderC3() {
    //物件資料蒐集
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.category] == undefined) {
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(total)
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    let newData = [];
    categoryAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(total[item])
        newData.push(ary)
        console.log(newData)
    })

    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
    });
}

//C3_LV2
function renderC3_LV2() {
    //物件資料蒐集
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.title] == undefined) {
                total[productItem.title] = productItem.price * productItem.quantity;
            } else {
                total[productItem.title] += productItem.price * productItem.quantity;
            }
        })
    })

    // 做出資料關聯
    let categoryAry = Object.keys(total);
    let newData = [];
    categoryAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(total[item])
        newData.push(ary)
        console.log(newData)
    })

    //sort排序
    newData.sort(function (a, b) {
        return b[1] - a[1] ;
    })

    //超過3筆納入其他
    if(newData.length > 3){
        let otherTotal = 0;
        newData.forEach(function(item,index){
            if(index >2){
                otherTotal += newData[index][1];
            }
        })
        newData.splice(3,newData.length-1);
        newData.push(["其他",otherTotal])
        console.log(newData)
    }

    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
        color: {
            pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
         }
    });

}

function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            orderData = response.data.orders;

            let str = "";
            orderData.forEach(item => {
                //組時間字串
                const timeStamp = new Date(item.createdAt * 1000);
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

                // 組產品字串
                let productStr = "";
                item.products.forEach(productItem => {
                    productStr += `<p>${productItem.title}*${productItem.quantity}</p>`
                })
                // 判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) {
                    orderStatus = "已處理";
                } else {
                    orderStatus = "未處理";
                }
                // 組訂單字串
                str += `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime
                    }</td>
            <td class="js-orderStatus">
                <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
            </td>
            </tr>`
            });
            orderList.innerHTML = str;
            renderC3_LV2();
            // ***注意渲染C3要放此，不然會有非同步問題
        })
}

orderList.addEventListener("click", e => {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    console.log(targetClass)

    let id = e.target.getAttribute("data-id");
    if (targetClass == "orderStatus") {
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status, id);
        return
    } else if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrderItem(id);
        return
    }
})

function changeOrderStatus(status, id) {
    let newStatus;
    if (status == "true") {
        newStatus = false;
    } else {
        newStatus = true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
                "id": id,
                "paid": newStatus
            }
        }
        , {
            headers: {
                'Authorization': token,
            }
        })
        .then(function (response) {
            alert("訂單狀態更改成功");
            getOrderList();
        })
}

function deleteOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            alert("訂單刪除成功");
            getOrderList();
        })
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", e => {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            alert("全部訂單刪除成功");
            getOrderList();
        })
})



// time.getMinutes().toString().padStart(2,'0')
// 時間處理padStart(2,'0')=>沒滿兩位數往前塞一個0
