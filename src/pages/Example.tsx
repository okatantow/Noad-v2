import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Example: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      {/* Launch Button */}
      <button
        onClick={() => setShow(true)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Launch Button
      </button>

      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Container */}
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh] mt-8
                         w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Modal Header */}
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Custom Modal Styling
              </h2>

              {/* Modal Body */}
              <p className="text-gray-600 mb-6">
                Ipsum molestiae natus adipisci modi eligendi? Debitis amet quae unde
                commodi aspernatur enim, consectetur. Cumque deleniti temporibus
                ipsam atque a dolores quisquam quisquam adipisci possimus
                laboriosam. Quibusdam facilis doloribus debitis! Sit quasi quod
                accusamus eos quod. Ab quos consequuntur eaque quo rem! Mollitia
                reiciendis porro quo magni incidunt dolore amet atque facilis ipsum
                deleniti rem!
              </p>

              {/* Close Button */}
              <button
                onClick={() => setShow(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Example;
