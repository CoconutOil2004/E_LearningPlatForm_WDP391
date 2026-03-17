/**
 * AdminPageLayout — common wrapper for all Admin pages
 * Provides: ConfigProvider, motion wrapper, page header (title + subtitle + action button),
 * and optional stats row.
 */
import { ConfigProvider } from "antd";
import { motion } from "framer-motion";
import { adminTheme, COLOR } from "../../styles/adminTheme";
import { pageVariants } from "../../utils/helpers";

const AdminPageLayout = ({ children, style }) => (
  <ConfigProvider theme={adminTheme}>
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        padding: 24,
        background: COLOR.bgPage,
        minHeight: "100vh",
        ...style,
      }}
    >
      {children}
    </motion.div>
  </ConfigProvider>
);

export default AdminPageLayout;
