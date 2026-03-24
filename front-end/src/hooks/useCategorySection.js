import { useEffect, useRef, useState } from "react";
import CourseService from "../services/api/CourseService";

/**
 * useCategorySection
 * ──────────────────
 * Fetch categories from BE, then for each category fetch N courses.
 * Used for the HomePage "Courses by Topic" section.
 *
 * @param {{ limit?: number, sortBy?: string, maxCategories?: number }} options
 *   - limit:          number of courses per category (default 4)
 *   - sortBy:         popular | rating | priceAsc | priceDesc (default "popular")
 *   - maxCategories:  only fetch first N categories (default 5, avoid too many requests)
 *
 * @returns {{
 *   sections: Array<{
 *     category: { _id, name, slug },
 *     courses:  Array,
 *     total:    number,
 *   }>,
 *   loading:  boolean,
 *   error:    string | null,
 *   refetch:  () => void,
 * }}
 *
 * FLOW:
 *   1. Fetch /api/categories                     → category list
 *   2. Promise.allSettled([...getCoursesByCategory])  → courses per category (parallel)
 *   3. Filter out categories with no courses
 *
 * ERROR STRATEGY:
 *   - If categories fetch fails → error state, sections = []
 *   - If some categories fail → skip those categories (allSettled), don't crash whole process
 */
const useCategorySection = ({
  limit = 4,
  sortBy = "popular",
  maxCategories = 5,
} = {}) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // trigger refetch

  // Dùng AbortController để cancel request nếu component unmount
  const abortRef = useRef(null);

  useEffect(() => {
    // Cancel request cũ nếu có
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // ── STEP 1: get categories list ────────────────────────────
        const categories = await CourseService.getCategories();
        if (cancelled) return;

        if (!categories.length) {
          setSections([]);
          setLoading(false);
          return;
        }

        // Take only first maxCategories
        const targetCategories = categories.slice(0, maxCategories);

        // ── STEP 2: fetch courses in parallel (allSettled = don't crash if one fails) ──
        const results = await Promise.allSettled(
          targetCategories.map((cat) =>
            CourseService.getCoursesByCategory(cat._id, { limit, sortBy }),
          ),
        );

        if (cancelled) return;

        // ── STEP 3: merge category + courses, filter empty categories ──────────
        const built = [];
        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const { courses, pagination } = result.value;
            if (courses.length > 0) {
              built.push({
                category: targetCategories[idx],
                courses,
                total: pagination?.total ?? courses.length,
              });
            }
          }
          // if rejected → skip that category (no throw)
        });

        setSections(built);
      } catch (err) {
        if (cancelled) return;
        console.error("[useCategorySection] fetch error:", err);
        setError(err.message ?? "Failed to load courses");
        setSections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [limit, sortBy, maxCategories, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { sections, loading, error, refetch };
};

export default useCategorySection;
