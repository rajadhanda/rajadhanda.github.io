// Small delights are optional; all content and navigation work without JavaScript.
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  const button = document.getElementById("littleSurprise");
  const message = document.getElementById("surpriseMessage");
  const reminders = [
    "Make something just because.",
    "Take the scenic route.",
    "Ask one more question.",
    "Stay curious",
  ];
  let index = 0;
  button.addEventListener("click", () => {
    const reminder = reminders[index++ % reminders.length];
    button.firstChild.textContent = reminder + " ";
    message.textContent = reminder;
    button.classList.remove("is-spinning");
    requestAnimationFrame(() => button.classList.add("is-spinning"));
  });
})();
