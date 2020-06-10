async function getRecipeList() {
    let recipeList = document.getElementById('recipeList');
    let recipes = axios('http:localhost:3200/recipes/').then(data => {
        data.data.forEach(element => {
            let newElem = document.createElement('li');
            let newText = document.createTextNode(element.name);
            newElem.setAttribute('recipeData',JSON.stringify(element));
            newElem.appendChild(newText);
            newElem.onclick=() => {
                addToUsingList(newElem);
            }
            recipeList.appendChild(newElem);
        });
    })
}

async function getIngredientList() {
    let ingList = document.getElementById("ingList");
    let ingredients = axios('http:localhost:3200/getIngredients/').then(data => {
        data.data.forEach(element => {
            let newElem = document.createElement('li');
            let newText = document.createTextNode(element.name);
            newElem.appendChild(newText);
            ingList.appendChild(newElem);
        })
    })
}

function addToUsingList(recipeElem) {
    let clone = recipeElem.cloneNode(true);
    let usingList = document.getElementById('recipiesUsedList');
    usingList.appendChild(clone);
}

function printShoppingList(data) {
    let listOfKeys = Object.keys(data);
    let text = "";
    listOfKeys.forEach(elem => {
        text += `${elem}: ${data[elem].amount} ${data[elem].measure} <br>`;
    })
    document.getElementById('shoppingListOutput').innerHTML=text;
}

async function generateRecipeList() {
    let dataToSend = [];
    let recipiesUsedList = document.getElementById('recipiesUsedList');
    let listOfChildren = recipiesUsedList.getElementsByTagName('li');
    for(i=0;i<listOfChildren.length;i++) {
        dataToSend.push(JSON.parse(listOfChildren[i].getAttribute('recipeData')));
    }
    console.log(dataToSend)
    return dataToSend;
}

async function getShoppingList() {
    generateRecipeList().then(data => {
        axios.post('http:/localhost:3200/new-shopping-list/',
            data
        ).then(result => printShoppingList(result.data)).catch(err => {
            console.log(err.response);
        })
    })
}

async function addIngredient() {
    var ingName = document.getElementById("ingName").value;
    var countBool = document.getElementById("countBool").checked;
    axios.post(`http://localhost:3200/new-ingredient/${ingName}/${countBool}`).then(data => {
        console.log(data.data);
    }).catch(err => {
        console.log(err.response.data.message);
    })
}

getRecipeList();
getIngredientList();


