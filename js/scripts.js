let listOfIngredients = [];
let listOfIngredientsUsed = [];

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

// async function getIngredientList() {
//     let ingList = document.getElementById("ingList");
//     let ingredients = axios('http:localhost:3200/getIngredients/').then(data => {
//         data.data.forEach(element => {
//             let finalDiv = document.createElement('div');
//             let newElem = document.createElement('li');
//             let newText = document.createTextNode(element.name);
//             newElem.appendChild(newText);
//             newElem.setAttribute('isCount',element.isMeasuredByCount);
//             newElem.onclick=() => {
//                 addToUsedIngredients(finalDiv);
//             }
//             newElem.style.display='inline';
//             finalDiv.appendChild(newElem);
//             ingList.appendChild(finalDiv);
//         })
//     })
// }

async function getIngredientList() {
    listOfIngredients=[];
    let ingredients = axios('http:localhost:3200/getIngredients/').then(data => {
                data.data.forEach(element => {
                    listOfIngredients.push(element);
                })
            })
}

function addToUsingList(recipeElem) {
    let clone = recipeElem.cloneNode(true);
    let usingList = document.getElementById('recipiesUsedList');
    clone.classList.add("animate-in");
    usingList.appendChild(clone);
}



function returnOptionsHtml() {
    let html = "<option value='tsp'>tsp</option> \
                <option value='tbsp'>tbsp</option> \
                <option value='cups'>cups</option>";
    return html;
}

function printShoppingList(data) {
    let app = document.getElementById("app");
    let container = document.getElementsByClassName('output-container');
    let shoppingListOutput = document.getElementById('shoppingListOutput')
    let listOfKeys = Object.keys(data);
    let text = "";
    listOfKeys.forEach(elem => {
        text += `${elem}: ${data[elem].amount} ${data[elem].measure} <br>`;
    })
    shoppingListOutput.innerHTML=text;
    container[0].style.display='block';
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
        ).then(result => {
            printShoppingList(result.data);
            document.getElementById("shopping-list-overlay").classList.add("visible");
        }).catch(err => {
            console.log(err.response);
        })
    })
}

async function addIngredient() {
    let ingName = document.getElementById("ingName").value;
    let countBool = document.getElementById("countBool").checked;
    console.log(countBool);
    axios.post(`http://localhost:3200/new-ingredient/${ingName}/${countBool}`).then(data => {
        alert(data.data.message);
        getIngredientList();
    }).catch(err => {
        console.log(err.response.data.message);
    })
}

async function sendRecipe() {
    let tags = document.getElementById("tags").value;
    let link = document.getElementById("link").value;
    let name = document.getElementById("recipeName").value;
    let ingredientChildren = document.getElementById("ingredientsUsed").children;
    let ingredientsList = [];
    for(let i = 0; i < ingredientChildren.length;i++) {
        let newIng = {};
        newIng.name = ingredientChildren[i].firstChild.textContent;
        newIng.amount = ingredientChildren[i].getElementsByTagName('input')[0].value;
        if(ingredientChildren[i].children.length==3){
            newIng.measure = ingredientChildren[i].getElementsByTagName('select')[0].value;
        }
        else {
            newIng.measure = "count";
        }
        ingredientsList.push(newIng);
    }
    let recipe = {"name":name,"link":link,"tags":tags,"ingredients":ingredientsList};
    axios.post("http://localhost:3200/new-recipe",recipe).then(data => {
        console.log(data.data);
    }).catch(err => {
        console.log(err.response.data.message);
    })
}

function removeOldListItems() {
    let listItems = document.getElementsByClassName('selection-items');
    while(listItems[0]) {
        listItems[0].parentNode.removeChild(listItems[0]);
    }
}
    

function narrowSearch(event) {
    if (event.keyCode==8) {
        removeOldListItems();
        return;
    }
    removeOldListItems();
    let selectionContainer = document.createElement("DIV");
    let input = document.getElementById('ingredient-filter');
    let currentValue = input.value;
    listOfIngredients.forEach(ing => {
        if (ing.name.substr(0,currentValue.length) == currentValue) {
            let newSelection = document.createElement("DIV");
            let newText = document.createTextNode(ing.name);
            newSelection.appendChild(newText);
            newSelection.onclick= () => {addToUsedIngredients(ing)};
            newSelection.classList.add("single-selection-item");
            selectionContainer.appendChild(newSelection);
        }
    })
    selectionContainer.classList.add("selection-items");
    document.getElementById("autofill-container").appendChild(selectionContainer);
}

function addToUsedIngredients(ingElem) {
    removeOldListItems();
    document.getElementById("ingredient-filter").value="";
    let usingList = document.getElementById('ingredientsUsed');
    let newElem = document.createElement("DIV");
    let newText = document.createTextNode(ingElem.name);
    let newSpan = document.createElement("SPAN");
    let deleteDiv = document.createElement("DIV");
    let deleteSpan = document.createElement("SPAN");
    let deleteText = document.createTextNode("X");
    deleteSpan.appendChild(deleteText);
    deleteDiv.appendChild(deleteSpan);
    newSpan.appendChild(newText);
    newElem.appendChild(newSpan);
    newElem.classList.add("ingredient-setup");
    deleteDiv.classList.add("delete-div");
    deleteSpan.classList.add("delete-span");
    console.log(ingElem);
    if(ingElem.isMeasuredByCount=="true") {
        let input = document.createElement('INPUT');
        input.setAttribute('type','number');
        input.style.display='inline';
        newElem.appendChild(input);
    }
    else {
        let input = document.createElement('INPUT');
        input.setAttribute('type','number');
        input.style.display='inline';
        newElem.appendChild(input);
        let select = document.createElement('select');
        select.innerHTML+=returnOptionsHtml();
        newElem.appendChild(select);
    }
    newElem.appendChild(deleteDiv);
    deleteDiv.onclick=() => {removeSelection(newElem)};
    usingList.appendChild(newElem);
}

function removeSelection(elem) {
    elem.remove();
}

function closeOverlay() {
    document.getElementById("shopping-list-overlay").classList.remove("visible");
}

getRecipeList();
getIngredientList();


