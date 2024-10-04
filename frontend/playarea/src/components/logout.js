import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      errors
    }
  }
`;

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
