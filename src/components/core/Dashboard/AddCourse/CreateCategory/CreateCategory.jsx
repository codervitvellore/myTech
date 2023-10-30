import React from "react";
import { createCategorey } from "../../../../../services/operations/courseDetailsAPI";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

const CreateCategory = () => {
  const {
    register,
    handleSubmit,
    name,
    setValue,

    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();

  function createCategoryHandler(data) {
    dispatch(createCategorey(data));
    console.log(data);
  }

  return (
    <div>
      <form onSubmit={handleSubmit(createCategoryHandler)}>
        {/* Create Category */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="createCategory">
            Create Category <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="categoryName"
            defaultValue=""
            setValue={setValue}
            name={name}
            {...register("categoryName", { required: true })}
            className="form-style w-full"
            placeholder="Type Category Name"
          />
          <input
            id="categoryDescription"
            defaultValue=""
            setValue={setValue}
            name={name}
            {...register("categoryDescription", { required: true })}
            className="form-style w-full"
            placeholder="Type Category Description"
          />

          {errors.createCategory && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Create Category is required
            </span>
          )}

          <button className="text-richblack-600 bg-richblack-25">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
