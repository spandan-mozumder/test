import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, clearError } from "@/store/authSlice";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { User01, Mail01, Lock01 } from "@untitledui/icons";
import toast from "react-hot-toast";
import { animate, stagger, createTimeline } from "animejs";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formRef.current) return;
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(formRef.current.querySelectorAll(".auth-logo"), {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 600,
    })
      .add(
        formRef.current.querySelectorAll(".auth-element"),
        {
          opacity: [0, 1],
          translateY: [30, 0],
          delay: stagger(70),
          duration: 700,
        },
        "-=300"
      );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate("/products");
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-primary px-4 overflow-hidden">
      <div className="orb orb-1" style={{ opacity: 0.15 }} />
      <div className="orb orb-3" style={{ opacity: 0.15 }} />

      <div className="w-full max-w-md relative z-10" ref={formRef}>
        <div className="mb-8 text-center">
          <div className="auth-logo" style={{ opacity: 0 }}>
            <Link
              to="/"
              className="mb-6 inline-block text-display-xs font-bold text-brand-tertiary text-shimmer"
            >
              blnK
            </Link>
          </div>
          <h1
            className="auth-element text-display-xs font-semibold text-primary"
            style={{ opacity: 0 }}
          >
            Create an account
          </h1>
          <p
            className="auth-element mt-2 text-md text-tertiary"
            style={{ opacity: 0 }}
          >
            Join blnK and start shopping today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="auth-element" style={{ opacity: 0 }}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(v) => setName(v)}
              iconLeading={User01}
              isRequired
            />
          </div>
          <div className="auth-element" style={{ opacity: 0 }}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(v) => setEmail(v)}
              iconLeading={Mail01}
              isRequired
            />
          </div>
          <div className="auth-element" style={{ opacity: 0 }}>
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(v) => setPassword(v)}
              iconLeading={Lock01}
              isRequired
            />
          </div>
          <div className="auth-element" style={{ opacity: 0 }}>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              iconLeading={Lock01}
              isRequired
            />
          </div>

          {error && (
            <p className="text-sm text-error-primary">{error}</p>
          )}

          <div className="auth-element" style={{ opacity: 0 }}>
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full glow-border"
              isDisabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>

        <p
          className="auth-element mt-8 text-center text-sm text-tertiary"
          style={{ opacity: 0 }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-secondary hover:text-brand-secondary_hover"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
