import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/components/shared/SidebarNav";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Index = () => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
        <div className="flex h-full max-h-screen flex-col overflow-y-auto">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h1 className="flex items-center gap-2 font-semibold text-lg">
              Rental Mgmt
            </h1>
          </div>
          <SidebarNav />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={85}>
        <div className="flex h-full flex-col">
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Index;