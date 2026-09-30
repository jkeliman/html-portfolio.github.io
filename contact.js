// Paste the Power Automate HTTP trigger URL here. Leave empty to fall back to mailto.
const ENDPOINT = "";
const FALLBACK_EMAIL = "john@pnatuna.com";
const MIN_FILL_MS = 3000;
const TIMEOUT_MS = 15000;

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

if (form && status) {
  const loadedAt = Date.now();
  const button = form.querySelector('button[type="submit"]');
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const say = (text, kind) => {
    status.textContent = text;
    status.dataset.kind = kind || "";
  };

  const read = () => ({
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  });

  const validate = ({ name, email, message }) => {
    if (!name) return "Enter your name.";
    if (!isEmail(email)) return "Enter a valid email address.";
    if (message.length < 10)
      return "Write a message of at least 10 characters.";
    if (message.length > 2000) return "Keep the message under 2000 characters.";
    return "";
  };

  const openMailClient = ({ name, message }) => {
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = read();
    const problem = validate(data);
    if (problem) return say(problem, "error");

    // Bots fill the hidden field or submit instantly. Pretend success and send nothing.
    if (form.website.value || Date.now() - loadedAt < MIN_FILL_MS) {
      form.reset();
      return say("Thank you. Your message was sent.", "ok");
    }

    if (!ENDPOINT) {
      say("Opening your email app.", "ok");
      return openMailClient(data);
    }

    button.disabled = true;
    say("Sending.", "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // text/plain keeps this a simple request, so the browser sends no CORS preflight.
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ ...data, page: location.href }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      say("Thank you. Your message was sent.", "ok");
    } catch {
      say(
        `The message did not send. Email ${FALLBACK_EMAIL} instead.`,
        "error",
      );
    } finally {
      clearTimeout(timer);
      button.disabled = false;
    }
  });
}
