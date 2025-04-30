const ingredientInput = document.getElementById("ingredient-input");
const addIngredientBtn = document.getElementById("add-ingredient");
const ingredientList = document.getElementById("ingredient-list");
const findRecipesBtn = document.getElementById("find-recipes");
const recipesContainer = document.getElementById("recipes");
const spinner = document.querySelector(".spinner");
const clearBtn = document.querySelector(".clear-ingredients");

const userIngredients = [];

const API_KEY = "5b1ec75c374f4bc4bea47da8588624f1";

// Lägga till ingredienser i lista
function addIngredient() {
  const ingredient = ingredientInput.value.trim().toLowerCase();
  if (ingredient && !userIngredients.includes(ingredient)) {
    userIngredients.push(ingredient);
    const li = document.createElement("li");
    li.textContent = ingredient;

    li.addEventListener("click", () => {
      const index = userIngredients.indexOf(ingredient);
      if (index > -1) {
        userIngredients.splice(index, 1);
      }
      li.remove();
    });
    ingredientList.appendChild(li);
    ingredientInput.value = "";
  }

  if (!ingredient) {
    alert("Please add an ingredient");
    return;
  }
}

addIngredientBtn.addEventListener("click", addIngredient);
ingredientInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIngredient();
  }
});

// Förslag på ingrediens

// Stäng förslag när man klickar utanför

// Söka efter recepten baserat på vilka ingredienser du har skrivit ned
findRecipesBtn.addEventListener("click", async () => {
  if (userIngredients.length === 0) {
    alert("Please add some ingredients first!");
    return;
  }

  const query = userIngredients.join(",");
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=10&apiKey=${API_KEY}`;

  // SHOW SPINNER

  spinner.style.display = "block";
  recipesContainer.innerHTML = "";

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayRecipes(data);
  } catch (error) {
    console.error("Error fetching recpies:", error);
    recipesContainer.innerHTML =
      "<p>Failed to fetch  recipes. Try again later.</p>";
  } finally {
    spinner.style.display = "none";
  }
});

// Visar recepten

function displayRecipes(recipes) {
  recipesContainer.innerText = "";

  if (recipes.length === 0) {
    recipesContainer.innerHTML =
      "<p>No recpies found. Try adding more ingredients</p>";
    return;
  }

  recipes.forEach((recipe, index) => {
    const div = document.createElement("div");
    div.classList.add("recipe-card");
    div.style.animationDelay = `${index * 0.1}s`;

    div.innerHTML = `
    <img src='${recipe.image}' alt='${recipe.title}'>
    <a href="https://spoonacular.com/recipes/${recipe.title
      .replace(/\s+g/g, "-")
      .toLowerCase()}-${recipe.id}" target="_blank">${recipe.title}</a>
    `;

    recipesContainer.appendChild(div);
  });
}

// Ta bort alla ingredienser

clearBtn.addEventListener("click", () => {
  userIngredients.length = 0;
  ingredientList.innerHTML = "";
});
// Spara-funktioner

// Sparar ingredienserna

// Favorisera en rätt
