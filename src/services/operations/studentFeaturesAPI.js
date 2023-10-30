import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  console.log(
    "Student Feature Apii---->",

    "courses--->",
    courses,
    "userDetailes--->",
    userDetails
  );
  const toastId = toast.loading("Loading...");
  try {
    //load the script
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    console.log("res----------------->>", res);

    if (!res) {
      toast.error("RazorPay SDK failed to load");
      return;
    }
    console.log("before api connector");
    //initiate the order
    // console.log("apiConnector 888888888---->", token);
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("After api connector");

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }
    console.log("PRINTING orderResponse", orderResponse);
    //options

    console.log("Before options object inside student feature ali---->");
    console.log(process.env.RAZORPAY_KEY);
    console.log(process.env);
    const options = {
      // key: process?.env?.RAZORPAY_KEY,
      key: "rzp_test_Qq1R28RDozLWGC",
      currency: orderResponse.data.data?.currency,
      amount: `${orderResponse.data.data?.amount}`,
      order_id: orderResponse.data.data?.id,
      name: "StudyNotion",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName}`,
        email: userDetails.email,
      },

      handler: function (response) {
        //send successful wala mail
        console.log("before sendPaymentSuccessEmail ------->");
        sendPaymentSuccessEmail(
          response,
          orderResponse.data.data?.amount,
          token
        );
        console.log("after sendPaymentSuccessEmail ------->");
        //verifyPayment
        console.log("before verify payment");
        verifyPayment({ ...response, courses }, token, navigate, dispatch);
        console.log("after verify payment");
      },
    };
    console.log(
      "After options object inside student feature ali----> options",
      options
    );
    //miss hogya tha

    console.log("before paymentObject --->");

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      paymentObject.on("payment.failed", function (response) {
        toast.error("oops, payment failed");
        console.log("payment object se error aa rha hai--->", response.error);
      });

      console.log("inside try paymentObject----->", paymentObject);

      console.log("inside another try block------>");
    } catch (error) {
      console.log(error);
      console.log(error.message);
    }

    console.log("after paymentObject --->");
  } catch (error) {
    console.log("PAYMENT API ERROR.....", error);
    toast.error("Could not make Payment");
  }
  toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
  }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment....");
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message);
    }
    toast.success("payment Successful, ypou are addded to the course");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR....", error);
    toast.error("Could not verify Payment");
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
