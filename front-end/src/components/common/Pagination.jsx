import { motion } from "framer-motion";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  const getVisiblePages = () => {
    const delta = 1;
    const pages = [];

    // Calculate range
    let leftBound = Math.max(1, currentPage - delta);
    let rightBound = Math.min(totalPages, currentPage + delta);

    const numPagesToShow = 5;
    if (rightBound - leftBound + 1 < Math.min(numPagesToShow, totalPages)) {
      if (currentPage < totalPages / 2) {
        rightBound = Math.min(leftBound + numPagesToShow - 1, totalPages);
      } else {
        leftBound = Math.max(rightBound - numPagesToShow + 1, 1);
      }
    }

    if (leftBound > 1) {
      pages.push(1);
      if (leftBound > 2) {
        pages.push("ellipsis-start");
      }
    }

    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    if (rightBound < totalPages) {
      if (rightBound < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const goToFirstPage = () => onPageChange(1);
  const goToLastPage = () => onPageChange(totalPages);

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.5 },
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={`${className || ""} py-4`} aria-label="Pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First page button */}
        <motion.button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          whileHover={currentPage !== 1 ? "hover" : "disabled"}
          whileTap={currentPage !== 1 ? "tap" : "disabled"}
          variants={buttonVariants}
          className={`hidden sm:flex items-center justify-center h-10 px-2 rounded-lg
            ${
              currentPage === 1
                ? "text-disabled cursor-not-allowed bg-subtle"
                : "text-body hover:bg-subtle hover:text-primary"
            } transition-colors`}
          aria-label="First page"
        >
          <FaAngleDoubleLeft className="w-3 h-3" />
        </motion.button>

        {/* Previous button */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          whileHover={currentPage !== 1 ? "hover" : "disabled"}
          whileTap={currentPage !== 1 ? "tap" : "disabled"}
          variants={buttonVariants}
          className={`flex items-center justify-center h-10 w-10 rounded-lg
            ${
              currentPage === 1
                ? "text-disabled cursor-not-allowed bg-subtle"
                : "text-body hover:bg-subtle hover:text-primary"
            } transition-colors`}
          aria-label="Previous page"
        >
          <FaChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* Page numbers */}
        <div className="flex flex-wrap items-center gap-2">
          {getVisiblePages().map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <span
                  key={page}
                  className="flex items-center justify-center w-10 h-10 text-muted"
                  aria-hidden="true"
                >
                  ···
                </span>
              );
            }

            return (
              <motion.button
                key={index}
                onClick={() => onPageChange(page)}
                whileHover={currentPage !== page ? "hover" : "disabled"}
                whileTap={currentPage !== page ? "tap" : "disabled"}
                variants={buttonVariants}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg font-medium text-sm
                  ${
                    currentPage === page
                      ? "bg-primary text-white shadow-md"
                      : "text-body hover:bg-subtle hover:text-primary"
                  } transition-colors`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {currentPage === page && (
                  <motion.span
                    layoutId="activePageHighlight"
                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                  />
                )}
                {page}
              </motion.button>
            );
          })}
        </div>

        {/* Next button */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          whileHover={currentPage !== totalPages ? "hover" : "disabled"}
          whileTap={currentPage !== totalPages ? "tap" : "disabled"}
          variants={buttonVariants}
          className={`flex items-center justify-center h-10 w-10 rounded-lg
            ${
              currentPage === totalPages
                ? "text-disabled cursor-not-allowed bg-subtle"
                : "text-body hover:bg-subtle hover:text-primary"
            } transition-colors`}
          aria-label="Next page"
        >
          <FaChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Last page button */}
        <motion.button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          whileHover={currentPage !== totalPages ? "hover" : "disabled"}
          whileTap={currentPage !== totalPages ? "tap" : "disabled"}
          variants={buttonVariants}
          className={`hidden sm:flex items-center justify-center h-10 px-2 rounded-lg
            ${
              currentPage === totalPages
                ? "text-disabled cursor-not-allowed bg-subtle"
                : "text-body hover:bg-subtle hover:text-primary"
            } transition-colors`}
          aria-label="Last page"
        >
          <FaAngleDoubleRight className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Page info */}
      <div className="mt-3 text-sm text-center text-muted">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;
