<?php

declare(strict_types = 1);

namespace App\Pdf;

use iio\libmergepdf\Driver\DriverInterface;
use iio\libmergepdf\Exception;
use iio\libmergepdf\Source\SourceInterface;

final class CustomTcpdiDriver implements DriverInterface
{
    /**
     * @var CustomTCPDI
     */
    private $tcpdi;

    public function __construct(CustomTCPDI $tcpdi = null)
    {
        $this->tcpdi = $tcpdi ?: new CustomTCPDI();
    }

    public function merge(SourceInterface ...$sources): string
    {
        $sourceName = '';

        try {
            $tcpdi = clone $this->tcpdi;

            foreach ($sources as $source) {
                $sourceName = $source->getName();
                $pageCount = $tcpdi->setSourceData($source->getContents());
                $pageNumbers = $source->getPages()->getPageNumbers() ?: range(1, $pageCount);

                foreach ($pageNumbers as $pageNr) {
                    $template = $tcpdi->importPage($pageNr);
                    $size = $tcpdi->getTemplateSize($template);
                    $tcpdi->SetPrintHeader(false);
                    $tcpdi->SetPrintFooter(false);
                    $tcpdi->AddPage(
                        $size['w'] > $size['h'] ? 'L' : 'P',
                        [$size['w'], $size['h']]
                    );
                    $tcpdi->useTemplate($template);
                }
            }

            return $tcpdi->Output('', 'S');
        } catch (\Exception $e) {
            throw new Exception("'{$e->getMessage()}' in '$sourceName'", 0, $e);
        }
    }
}
