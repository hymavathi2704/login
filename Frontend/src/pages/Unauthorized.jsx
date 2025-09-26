import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
      <div className="max-w-md">
        <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center mb-6">
          <Icon name="ShieldAlert" size={32} color="white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, you do not have the necessary permissions to access this page.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="outline" asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;