"use client";

import { Alert, AlertTitle } from "../ui/alert";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const ErrorUI = () => {
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardHeader className="flex flex-col items-center">
          <Alert variant="destructive" className="mb-4 w-full text-center">
            <AlertTitle className="text-lg font-semibold">
              Something broke while syncing with your trading setup
            </AlertTitle>
          </Alert>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            We hit a snag connecting to your trading data. Don&apos;t worry — our system is resilient.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.refresh()}
              className="primary-gradient w-fit text-white"
              variant="default"
            >
              Retry Sync
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorUI;