import { motion } from "framer-motion";
import { pageVariants } from "../../../utils/helpers";

// Full implementation in ELearningPlatform.jsx — extract here
const StudentProfilePage = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <div className="px-6 py-10 mx-auto max-w-7xl">
      <h1 className="text-3xl font-black text-gray-900">StudentProfilePage</h1>
    </div>
  </motion.div>
);
export default StudentProfilePage;
