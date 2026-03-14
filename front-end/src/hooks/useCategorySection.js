import { useState, useEffect, useRef } from "react";
import CourseService from "../services/api/CourseService";

/**
 * useCategorySection
 * ──────────────────
 * Fetch categories từ BE, sau đó với mỗi category fetch N courses.
 * Used for the HomePage "Courses by Topic" section.
 *
 * @param {{ limit?: number, sortBy?: string, maxCategories?: number }} options
 *   - limit:          số course mỗi category (default 4)
 *   - sortBy:         popular | rating | priceAsc | priceDesc (default "popular")
 *   - maxCategories:  chỉ lấy N category đầu tiên (default 5, tránh quá nhiều request)
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
 *   1. Fetch /api/categories                     → danh sách categories
 *   2. Promise.allSettled([...getCoursesByCategory])  → courses per category (parallel)
 *   3. Lọc bỏ category nào không có course nào
 *
 * ERROR STRATEGY:
 *   - Nếu fetch categories lỗi → error state, sections = []
 *   - Nếu một vài category lỗi → bỏ qua category đó (allSettled), không crash toàn bộ
 */
const useCategorySection = ({
  limit         = 4,
  sortBy        = "popular",
  maxCategories = 5,
} = {}) => {
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tick,     setTick]     = useState(0); // trigger refetch

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
        // ── STEP 1: lấy danh sách categories ────────────────────────────
        const categories = await CourseService.getCategories();
        console.log("✅ Categories:", categories);  
        if (cancelled) return;

        if (!categories.length) {
          setSections([]);
          setLoading(false);
          return;
        }

        // Chỉ lấy maxCategories category đầu
        const targetCategories = categories.slice(0, maxCategories);

        // ── STEP 2: fetch courses song song (allSettled = không crash nếu 1 cái lỗi) ──
        const results = await Promise.allSettled(
          targetCategories.map((cat) =>
            CourseService.getCoursesByCategory(cat._id, { limit, sortBy })
          )
        );
        console.log("✅ Course results:", results);

        if (cancelled) return;

        // ── STEP 3: ghép category + courses, lọc category rỗng ──────────
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
          // nếu rejected → bỏ qua category đó (không throw)
        });

        setSections(built);
      } catch (err) {
        if (cancelled) return;
        console.error("[useCategorySection] fetch error:", err);
        setError(err.message ?? "Không thể tải danh sách khóa học");
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