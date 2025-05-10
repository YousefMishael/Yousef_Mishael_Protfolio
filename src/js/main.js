document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const sectionItems = document.querySelectorAll(".section__item");
  const mobileMenu = document.querySelector(".header__mobile_menu");
  const navMenu = document.querySelector(".header__nav");
  const sectionTitles = document.querySelectorAll("section h2");
  const experienceContainer = document.querySelector(".experience__container");
  const contactForm = document.getElementById("contactForm");
  const messageField = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const maxChars = 300;
  let lastScrollY = window.scrollY;

  const checkVisibility = () => {
    // Header animation
    if (window.scrollY > lastScrollY && window.scrollY > 50) {
      // Scrolling down
      header.classList.add("header--minimized");
    } else {
      // Scrolling up
      header.classList.remove("header--minimized");
    }
    lastScrollY = window.scrollY;

    // Section Titles items animation
    sectionTitles.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 0) {
        item.classList.add("in-view");
      }
    });

    // Experience items animation
    sectionItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 0) {
        item.classList.add("in-view");
      }
    });
  };

  // Show more/less details in experience section
  const showMore = (e) => {
    const button = e.target.closest(".experience__more-btn");
    if (!button) return;

    const details = button.nextElementSibling;
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", !isExpanded);
    details.classList.toggle("show");

    if (!isExpanded) {
      button.innerHTML = 'Less Info <i class="fas fa-chevron-up"></i>';
    } else {
      button.innerHTML = 'More Info <i class="fas fa-chevron-down"></i>';
    }
  };

  const handleMobileMenu = () => {
    navMenu.classList.toggle("header__nav--active");
  };

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".header__nav_container") &&
      !event.target.closest(".header__mobile_menu")
    ) {
      navMenu.classList.remove("header__nav--active");
    }
  });

  const loadExperience = () => {
    const experienceContainer = document.getElementById("experienceContainer");

    if (!experienceContainer) {
      console.error("Experience container not found");
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(entries[0].target);

          try {
            // Show loading skeletons using DocumentFragment
            const skeletonFragment = document.createDocumentFragment();
            for (let i = 0; i < 3; i++) {
              const skeleton = document.createElement("div");
              skeleton.className = "experience__skeleton section__item in-view";
              skeleton.innerHTML = `
                <div class="skeleton skeleton-title" style="width: ${
                  70 + Math.random() * 20
                }%"></div>
                <div class="skeleton skeleton-subtitle" style="width: ${
                  40 + Math.random() * 30
                }%"></div>
                <div class="skeleton skeleton-subtitle" style="width: ${
                  50 + Math.random() * 20
                }%"></div>
                <ul>
                  ${Array(3)
                    .fill()
                    .map(
                      () =>
                        `<li><div class="skeleton skeleton-text" style="width: ${
                          70 + Math.random() * 25
                        }%"></div></li>`
                    )
                    .join("")}
                </ul>
                <div class="skeleton skeleton-button" style="width: ${
                  25 + Math.random() * 15
                }%"></div>
              `;
              skeletonFragment.appendChild(skeleton);
            }
            experienceContainer.replaceChildren(skeletonFragment);

            await new Promise((resolve) => setTimeout(resolve, 1500));

            const response = await fetch("./data/experience.json");
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            const experiences = await response.json();

            const fragment = document.createDocumentFragment();

            experiences.forEach((exp, index) => {
              const expItem = document.createElement("div");
              expItem.className = "experience__item section__item in-view";

              const company = document.createElement("h3");
              company.textContent = exp.company;
              expItem.appendChild(company);

              const location = document.createElement("p");
              location.className = "experience__location";
              location.textContent = exp.location;
              expItem.appendChild(location);

              const role = document.createElement("p");
              role.className = "experience__role";
              role.innerHTML = `${exp.role} <span class="experience__date">${exp.dates}</span>`;
              expItem.appendChild(role);

              const ul = document.createElement("ul");
              ul.className = "experience__details";
              exp.highlights.forEach((hl) => {
                const li = document.createElement("li");
                li.textContent = hl;
                ul.appendChild(li);
              });
              expItem.appendChild(ul);

              if (exp.buttonText) {
                const button = document.createElement("button");
                button.className = "experience__more-btn";
                button.setAttribute("aria-expanded", "false");
                button.setAttribute("aria-controls", `exp-details-${index}`);
                button.innerHTML = `${exp.buttonText} <i class="fas fa-chevron-down"></i>`;

                const additionalDetails = document.createElement("div");
                additionalDetails.className = "experience__additional-details";
                additionalDetails.id = `exp-details-${index}`;
                const detailList = document.createElement("ul");
                exp.details.forEach((d) => {
                  const li = document.createElement("li");
                  li.textContent = d;
                  detailList.appendChild(li);
                });
                additionalDetails.appendChild(detailList);

                expItem.appendChild(button);
                expItem.appendChild(additionalDetails);
              }

              fragment.appendChild(expItem);
            });

            experienceContainer.replaceChildren(fragment);
            checkVisibility();
          } catch (error) {
            console.error("Error loading experience:", error);

            const errorDiv = document.createElement("div");
            errorDiv.className = "experience__error";
            errorDiv.innerHTML = `
              <i class="fas fa-exclamation-triangle"></i>
              <p>Failed to load experience data. Please try again later.</p>
              <button onclick="window.location.reload()">Retry</button>
            `;
            experienceContainer.replaceChildren(errorDiv);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(experienceContainer);
  };

  window.addEventListener("scroll", checkVisibility);
  mobileMenu.addEventListener("click", handleMobileMenu);
  experienceContainer.addEventListener("click", showMore);
  loadExperience();

  // Character counter
  messageField.addEventListener("input", () => {
    const remaining = maxChars - messageField.value.length;
    charCount.textContent = remaining;
    charCount.classList.toggle("error", remaining < 0);
  });

  document.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.validity.valid) {
        const errorElement = document.getElementById(`${field.id}Error`);
        if (errorElement) {
          errorElement.style.display = "none";
        }
      }
    });
  });

  // Field validation function
  function validateField(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (!field.validity.valid) {
      if (errorElement) {
        errorElement.textContent = getErrorMessage(field);
        errorElement.style.display = "block";
      }
      return false;
    }
    if (errorElement) {
      errorElement.style.display = "none";
    }
    return true;
  }

  // Custom error messages
  function getErrorMessage(field) {
    if (field.validity.valueMissing) {
      return "This field is required";
    }
    if (field.validity.typeMismatch) {
      return "Please enter a valid email address";
    }
    if (field.validity.tooShort) {
      return `Minimum length is ${field.minLength} characters`;
    }
    if (field.validity.tooLong) {
      return `Maximum length is ${field.maxLength} characters`;
    }
    if (field.validity.patternMismatch) {
      return field.title || "Invalid format";
    }
    return "Invalid input";
  }

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let formIsValid = true;

    document.querySelectorAll("input, textarea").forEach((field) => {
      if (!validateField(field)) {
        formIsValid = false;
      }
    });

    if (messageField.value.length > maxChars) {
      document.getElementById(
        "messageError"
      ).textContent = `Message must be ${maxChars} characters or less`;
      document.getElementById("messageError").style.display = "block";
      formIsValid = false;
    }

    if (formIsValid) {
      alert("Your message has been submitted successfully!");
      contactForm.reset();
      charCount.textContent = maxChars;
      charCount.classList.remove("error");
    }
  });
});
