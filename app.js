const ingredientInput = document.getElementById("ingredient-input");
const addIngredientBtn = document.getElementById("add-ingredient");
const ingredientList = document.getElementById("ingredient-list");
const findRecipesBtn = document.getElementById("find-recipes");
const recipesContainer = document.getElementById("recipes");
const spinner = document.querySelector(".spinner");
const clearBtn = document.querySelector(".clear-ingredients");
const dietFilter = document.getElementById("diet-filter");

let favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

const userIngredients = [];

const API_KEY = "5b1ec75c374f4bc4bea47da8588624f1";
// Lägga till ingredienser i lista
function addIngredient() {
  const ingredient =
    ingredientInput.value.trim().charAt(0).toUpperCase() +
    ingredientInput.value.trim().slice(1);

  if (!ingredient) {
    alert("Please add an ingredient");
    return;
  }

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
}

addIngredientBtn.addEventListener("click", addIngredient);
ingredientInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIngredient();
  }
});

// Förslag på ingrediens

// Söka efter recepten baserat på vilka ingredienser du har skrivit ned
findRecipesBtn.addEventListener("click", async () => {
  if (userIngredients.length === 0) {
    alert("Please add some ingredients first!");
    return;
  }
  // Select by diet not working, fixa senare
  // const query = userIngredients.join(",");
  // const selectedDiet = dietFilter.value;
  // const diet = selectedDiet; // e.g., "vegan", "vegetarian", etc.
  // const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${query}&number=10&diet=${selectedDiet}&addRecipeInformation=true&apiKey=${API_KEY}`;

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
    console.error("Error fetching recipies:", error);
    recipesContainer.innerHTML =
      "<p>Failed to fetch  recipes. Try again later.</p>";
  } finally {
    spinner.style.display = "none";
  }
});

// Favorisera en rätt
function isFavorite(id) {
  return favoriteRecipes.some((recipe) => recipe.id === id);
}

// Visar recepten

function displayRecipes(recipes) {
  recipesContainer.innerText = "";

  if (recipes.length === 0) {
    recipesContainer.innerHTML =
      "<p>No recipies found. Try adding more ingredients. Remember to add the recipes you love to your favorites.</p>";
    return;
  }

  recipes.forEach((recipe, index) => {
    const div = document.createElement("div");
    div.classList.add("recipe-card");
    div.style.animationDelay = `${index * 0.1}s`;

    div.innerHTML = `
    <img src='${recipe.image}' alt='${recipe.title}'>
    <a href="https://spoonacular.com/recipes/${recipe.title
      .replace(/\s+/g, "-")
      .toLowerCase()}-${recipe.id}" target="_blank">${recipe.title}</a>
      <button class="favorite-btn" data-id="${recipe.id}">
      <i class="fa${isFavorite(recipe.id) ? "s" : "r"} fa-heart"></i>
      </button>
    `;

    recipesContainer.appendChild(div);

    const favBtn = div.querySelector(".favorite-btn");

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(recipe);
      const icon = favBtn.querySelector("i");
      icon.classList.toggle("fas");
      icon.classList.toggle("far");

      icon.classList.add("heart-animate");

      icon.addEventListener("animationend", () => {
        icon.classList.remove("heart-animate"), { once: true };
      });
    });

    div.addEventListener("click", async () => {
      const infoUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`;
      try {
        const res = await fetch(infoUrl);
        const details = await res.json();
        showModal(details);
      } catch (error) {
        console.error("Error loading recipe details:", error);
      }
    });
  });
}

// Toggla favorite av och på

function toggleFavorite(recipe) {
  const index = favoriteRecipes.findIndex((r) => r.id === recipe.id);
  if (index > -1) {
    favoriteRecipes.splice(index, 1); // Remove
  } else {
    favoriteRecipes.push(recipe); // add
  }
  localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
}

// Ta bort alla ingredienser

clearBtn.addEventListener("click", () => {
  userIngredients.length = 0;
  ingredientList.innerHTML = "";
  recipesContainer.innerHTML = "";
});
// Visar favorite-recepten
document.querySelector(".show-favorites").addEventListener("click", () => {
  displayRecipes(favoriteRecipes);
});

// Modal

const modal = document.getElementById("recipe-modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  modalBody.innerHTML = "";
});

function showModal(details) {
  const steps = details.analyzedInstructions?.[0]?.steps;

  if (!steps || steps.length === 0) {
    modalBody.innerHTML = `<h2>${details.title}</h2><p>No instructions found.</p>`;
  } else {
    modalBody.innerHTML = `
    <h2>${details.title}</h2>
    <img src="${details.image}" alt="${
      details.title
    } style="max-width: 100%; border-radius: 10px; margin: 10px 0;"
    
    <ol> ${steps.map((step) => `<li>${step.step}</li>`).join("")} </ol>
    
    `;
  }

  modal.classList.remove("hidden");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const isModalVisible = !modal.classList.contains("hidden");
    if (isModalVisible) {
      modal.classList.add("hidden");
      modalBody.innerHTML = "";
    }
  }
});
