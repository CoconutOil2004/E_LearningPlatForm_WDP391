import { motion } from "framer-motion";
import { STATS } from "./homeConstants";

const StatsSection = () => (
  <section className="px-6 py-16 pb-24 mx-auto text-center max-w-7xl">
    <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
      Trusted by Thousands
    </h2>
    <p className="mb-16 font-medium text-muted">
      The fastest-growing tech learning community in Southeast Asia
    </p>
    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
      {STATS.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: s.delay }}
        >
          <div className="deep-glass p-12 rounded-[3rem] relative overflow-hidden flex flex-col justify-center items-center">
            <h3
              className="mb-4 text-6xl font-black gradient-text"
              style={{ letterSpacing: "-0.05em" }}
            >
              {s.value}
            </h3>
            <p className="text-muted font-bold uppercase tracking-[0.2em] text-[10px]">
              {s.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default StatsSection;
