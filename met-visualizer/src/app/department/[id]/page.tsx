export default async function DepartmentPage({ params }: { params: { id: string } }) {
    const { id } = params;
    
    return (
      <div className="min-h-screen flex flex-col items-center p-8 sm:p-20">
        {/* Header */}
        <header className="w-full flex justify-center py-4">
          <h1 className="text-2xl font-bold">{id}</h1>
        </header>
  
        {/* Footer */}
        <footer className="w-full flex justify-center py-4">
          <p className="text-sm">Footer Content</p>
        </footer>
      </div>
    );
  }