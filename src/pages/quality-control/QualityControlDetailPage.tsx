import { Card } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import {
  IQualityControl,
  getQualityControl,
} from "../../logic/quality-control.logic";

let savedQualityControl: IQualityControl | null = null;

export const QualityControlDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [qualityControl, setQualityControl] = useState<IQualityControl | null>(
    null
  );

  useEffect(() => {
    getQualityControl(id!).then((p) => {
      savedQualityControl = p;
      setQualityControl(p!);
      // setQualityControlSaved(true);
    });
  }, []);

  if (qualityControl === null) return null;

  return (
    <>
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
        {qualityControl._id}
      </Card>
    </>
  );
};
