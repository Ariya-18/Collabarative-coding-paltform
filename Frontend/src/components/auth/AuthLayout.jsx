import { motion } from "framer-motion";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass w-full max-w-md rounded-xl2 p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-bold text-transparent">
            CodeShare
          </h1>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;