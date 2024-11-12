import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { LOGOUT_MUTATION } from "../queries/mutations";

export const Logout = () => {
  const navigate = useNavigate();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      localStorage.removeItem("isLogged");
      localStorage.removeItem("username");
      navigate("/login");
    },
  });
  const logout = () => {
    logoutMutation();
  };
  return { logout };
};
