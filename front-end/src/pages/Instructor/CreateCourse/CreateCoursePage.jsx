import { motion } from "framer-motion";
import { pageVariants } from "../../../utils/helpers";

const CreateCoursePage = () => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900">CreateCoursePage</h1>
    </div>
  </motion.div>
);
export default CreateCoursePage;
