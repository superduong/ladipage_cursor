import { useCallback, useEffect, useRef, useState } from "react";

const initialErrors = { fullName: "", phone: "", email: "" };

function validateFullName(v) {
  const t = (v || "").trim();
  if (!t) return "Vui lòng nhập họ và tên.";
  if (t.length < 2) return "Họ tên quá ngắn.";
  return "";
}

function validatePhone(v) {
  const raw = (v || "").trim().replace(/\s/g, "");
  if (!raw) return "Vui lòng nhập số điện thoại.";
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.replace("+", "").length < 9) return "Số điện thoại không hợp lệ.";
  return "";
}

function validateEmail(v) {
  const t = (v || "").trim();
  if (!t) return "Vui lòng nhập email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Email không hợp lệ.";
  return "";
}

function validateAll(values) {
  return {
    fullName: validateFullName(values.fullName),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email),
  };
}

/** Nhận đăng ký qua FormSubmit → forward tới inbox */
const FORM_OWNER_EMAIL = "vanduong15@gmail.com";
const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${FORM_OWNER_EMAIL}`;

const HOTLINE_NAME = "Mr.Nam";
const HOTLINE_DISPLAY = "093 330 6170";
const HOTLINE_HREF = "tel:+84933306170";

/** FormSubmit trả về tiếng Anh; chuẩn hoá lỗi “chưa kích hoạt” cho người dùng cuối */
function formatFormSubmitError(raw) {
  const msg = typeof raw === "string" ? raw : "";
  const lower = msg.toLowerCase();
  if (
    lower.includes("activation") ||
    lower.includes("activate form") ||
    lower.includes("actived") ||
    lower.includes("activate your form")
  ) {
    return (
      `Form chưa được kích hoạt trên FormSubmit (chỉ làm một lần cho email ${FORM_OWNER_EMAIL}). ` +
      "Mở hộp thư đó, tìm email từ FormSubmit (kể cả mục Spam), bấm link kích hoạt / Activate Form, rồi quay lại trang và gửi lại form."
    );
  }
  return msg || "Không gửi được. Thử lại sau hoặc liên hệ trực tiếp qua inbox.";
}

export default function App() {
  const [values, setValues] = useState({ fullName: "", phone: "", email: "" });
  const [errors, setErrors] = useState(initialErrors);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successPayload, setSuccessPayload] = useState(null);
  const successRef = useRef(null);

  const clearFieldError = useCallback((key) => {
    setErrors((e) => ({ ...e, [key]: "" }));
  }, []);

  const updateField = useCallback(
    (key, value) => {
      setValues((v) => ({ ...v, [key]: value }));
      clearFieldError(key);
    },
    [clearFieldError]
  );

  useEffect(() => {
    if (successPayload && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [successPayload]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = validateAll(values);
    setErrors(nextErrors);
    const firstKey = ["fullName", "phone", "email"].find((k) => nextErrors[k]);
    if (firstKey) {
      document.getElementById(firstKey)?.focus();
      return;
    }

    const fullName = values.fullName.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    const payloadText =
      `Họ và tên: ${fullName}\nSĐT: ${phone}\nEmail: ${email}\n---\n(Đã gửi tới ${FORM_OWNER_EMAIL} qua form.)`;

    setSubmitting(true);
    try {
      const res = await fetch(FORM_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          email,
          _subject: "[Landing Cursor] Đăng ký tư vấn mới",
          _replyto: email,
          _template: "table",
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      const ok = data.success === true || data.success === "true";
      if (!res.ok || !ok) {
        setSubmitError(formatFormSubmitError(data.message));
        return;
      }
      setSuccessPayload(payloadText);
    } catch {
      setSubmitError("Lỗi mạng. Kiểm tra kết nối và thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setValues({ fullName: "", phone: "", email: "" });
    setErrors(initialErrors);
    setSubmitError("");
    setSuccessPayload(null);
  }

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <header className="site-header">
        <div className="container header-inner">
          <span className="logo">Xây app hiện đại cùng công nghệ AI tiên phong</span>
          <div className="header-actions">
            <a href={HOTLINE_HREF} className="header-hotline">
              <span className="header-hotline-text">
                Hotline {HOTLINE_NAME}: <strong>{HOTLINE_DISPLAY}</strong>
              </span>
            </a>
            <a href="#dang-ky" className="btn btn-ghost">
              Đăng ký tư vấn
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">🚀 Ưu đãi đặc biệt · Cursor AI</p>
            <h1 className="hero-title">
              Nhận làm dự án phần mềm — <em>chi phí cực kỳ ưu đãi</em>
            </h1>
            <p className="hero-lead">
              Hiện tại team mình được ưu tiên khi <strong>nhận được nhiều credit từ Cursor</strong> (AI hỗ trợ code top đầu thế giới), nên muốn tận dụng để build
              các dự án thực tế với chi phí cực kỳ ưu đãi cho mọi người.
            </p>
            <div className="hero-badges">
              <span className="pill pill-accent">Trải nghiệm AI thông minh nhất</span>
              <span className="pill pill-accent">Tư vấn miễn phí trước khi làm</span>
              <span className="pill pill-accent">Ưu tiên MVP & startup sớm</span>
              <a href={HOTLINE_HREF} className="pill pill-hotline">
                ☎ Hotline {HOTLINE_NAME}: {HOTLINE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="dich-vu">
          <div className="container">
            <h2 className="section-title">
              <span className="section-icon">💡</span> Mình nhận làm
            </h2>
            <ul className="card-grid">
              <li className="card">
                <h3>Web app</h3>
                <p>Full Stack gọn, chuẩn production.</p>
              </li>
              <li className="card">
                <h3>Backend &amp; hệ thống</h3>
                <p>API, quản lý, automation — kiến trúc rõ ràng, dễ mở rộng.</p>
              </li>
              <li className="card">
                <h3>MVP startup</h3>
                <p>Xây nhanh để test idea — đúng scope, ship được.</p>
              </li>
              <li className="card">
                <h3>Tool nội bộ</h3>
                <p>CRM, quản lý tài chính, workflow — theo quy trình của team bạn.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="section section-dim" id="loi-ich">
          <div className="container">
            <h2 className="section-title">
              <span className="section-icon">✅</span> Lợi ích khi làm với mình
            </h2>
            <ol className="benefits">
              <li>
                <span className="benefit-num">01</span>
                <div>
                  <strong>Giá tốt hơn thị trường</strong>
                  <p>Nhờ quy trình có AI hỗ trợ, tối ưu thời gian không đánh đổi chất lượng.</p>
                </div>
              </li>
              <li>
                <span className="benefit-num">02</span>
                <div>
                  <strong>Thời gian nhanh</strong>
                  <p>Iteration nhanh, feedback vòng lặp ngắn — phù hợp giai đoạn thử nghiệm.</p>
                </div>
              </li>
              <li>
                <span className="benefit-num">03</span>
                <div>
                  <strong>Code rõ ràng, dễ mở rộng</strong>
                  <p>Handoff sạch; team sau này bắt tay vào không bị “nợ kỹ thuật” vô ích.</p>
                </div>
              </li>
              <li>
                <span className="benefit-num">04</span>
                <div>
                  <strong>Tư vấn giải pháp miễn phí trước khi làm</strong>
                  <p>Thảo luận hướng đi, rủi ro, estimate — minh bạch trước khi cam kết.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="section cta-block">
          <div className="container cta-inner">
            <p className="eyebrow">📩 Liên hệ</p>
            <h2 className="cta-title">Bạn đang có idea hoặc cần làm hệ thống?</h2>
            <p className="cta-text">
              Vui lòng điền đầy đủ thông tin phía dưới — team mình sẽ{" "}
              <strong>tư vấn chiến lược làm hiệu quả nhất</strong> luôn.
            </p>
            <p className="cta-priority">👉 Ưu tiên các dự án nhỏ / MVP / startup giai đoạn đầu.</p>
            <p className="cta-hotline">
              <a href={HOTLINE_HREF} className="cta-hotline-link">
                Hotline {HOTLINE_NAME}: <strong>{HOTLINE_DISPLAY}</strong>
              </a>
            </p>
          </div>
        </section>

        <section className="section section-form" id="dang-ky">
          <div className="container form-wrap">
            <div className="form-intro">
              <h2 className="section-title">Đăng ký nhận tư vấn NGAY</h2>
              <p>
                *Không spam, không chia sẻ thông
                tin bên thứ ba.
              </p>
            </div>

            {!successPayload ? (
              <form className="lead-form" noValidate onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="fullName">
                    Họ và tên <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Nguyễn Văn A"
                    value={values.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    aria-invalid={errors.fullName ? "true" : undefined}
                    aria-describedby={errors.fullName ? "fullNameError" : undefined}
                  />
                  <span className="field-error" id="fullNameError" role="alert">
                    {errors.fullName}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="phone">
                    Số điện thoại <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    placeholder="09xx xxx xxx"
                    value={values.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    aria-invalid={errors.phone ? "true" : undefined}
                    aria-describedby={errors.phone ? "phoneError" : undefined}
                  />
                  <span className="field-error" id="phoneError" role="alert">
                    {errors.phone}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="email">
                    Email <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ban@email.com"
                    value={values.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={errors.email ? "true" : undefined}
                    aria-describedby={errors.email ? "emailError" : undefined}
                  />
                  <span className="field-error" id="emailError" role="alert">
                    {errors.email}
                  </span>
                </div>
                {submitError ? (
                  <p className="form-submit-error" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {!submitting ? (
                    <span className="btn-label">Gửi đăng ký</span>
                  ) : (
                    <span className="btn-loading">Đang gửi…</span>
                  )}
                </button>
                <p className="form-hint">
                  {/*Thông tin gửi tới email chủ trang. Nếu là lần đầu với FormSubmit: chủ địa chỉ email phải mở mail}
                  {FormSubmit và bấm kích hoạt một lần — sau đó form mới nhận được đăng ký (xem cả Spam).*/}
                </p>
              </form>
            ) : (
              <div className="form-success" ref={successRef}>
                <p className="success-title">✅ Đã gửi đăng ký</p>
                <p>
                  Cảm ơn bạn! Thông tin vừa gửi đã được chuyển tới email liên hệ. Mình sẽ phản hồi theo hướng làm và
                  estimate sớm nhất có thể.
                </p>
                <pre className="success-payload">{successPayload}</pre>
                <button type="button" className="btn btn-ghost" onClick={handleReset}>
                  Gửi thêm một đăng ký
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>Cảm ơn mọi người 🙌</p>
          <p className="footer-note"> © All rights are reserved by AI Tech Solutions.</p>
        </div>
      </footer>
    </>
  );
}
