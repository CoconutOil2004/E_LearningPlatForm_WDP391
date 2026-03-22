import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { GlassCard, TOOLS } from "./homeConstants";

const ToolsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-16 mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
          Next-gen Learning Tools
        </h2>
        <p className="font-medium text-muted">
          Everything you need to learn faster and smarter
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard
              className="p-8 rounded-[2.5rem] group hover:bg-white/80 transition-all duration-300 hover:border-primary/20 h-full cursor-pointer"
              onClick={() => navigate(tool.route)}
            >
              <div
                className="flex items-center justify-center mb-6 w-14 h-14 rounded-2xl"
                style={{ background: tool.bg }}
              >
                <Icon name={tool.icon} size={26} color={tool.iconColor} />
              </div>
              <h4 className="mb-3 text-xl font-bold text-heading">
                {tool.title}
              </h4>
              <p className="text-sm font-medium leading-relaxed text-muted">
                {tool.desc}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ToolsSection;
