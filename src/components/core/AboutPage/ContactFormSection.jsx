import React from "react";
import ContactUsForm from "../../ContactPage/ContactUsForm";

const ContactFormSection = () => {
  return (

    <div className="border border-richblack-600 text-richblack-300 rounded-xl p-12 lg:p-14 flex gap-3 flex-col mx-auto w-full">

      <h1 className="text-center text-4xl font-semibold">Get in Touch</h1>
      <p className="text-center text-richblack-300 mt-3">
        We&apos;d love to here for you, Please fill out this form.
      </p>

      <div className="mt-12  mx-6 md:mx-24">

        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactFormSection;