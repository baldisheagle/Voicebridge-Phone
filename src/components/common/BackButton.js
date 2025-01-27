import { IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const BackButton = () => {

    const navigate = useNavigate();

    return (
      <div style={{ position: 'fixed', top: 5, left: 5, cursor: 'pointer' }} onClick={() => navigate('/calls')}>
        <IconButton variant="soft" size="3" color="gray" radius="full" onClick={() => navigate('/calls')}><ArrowLeftIcon /></IconButton>
      </div>
    )
  }

export default BackButton;