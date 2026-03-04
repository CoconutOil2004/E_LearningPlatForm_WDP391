import { motion } from "framer-motion";
import { pageVariants } from "../../../utils/helpers";

// TODO: Full implementation in ELearningPlatform.jsx — extract here
const CourseDetailPage = () => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900">CourseDetailPage</h1>
      <p className="text-gray-500 mt-2">Page content goes here.</p>
    </div>
  </motion.div>
);
export default CourseDetailPage;
